import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';
import { ColorExtractorService } from 'src/common/services/color-extractor.service';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { AnimeService } from '../anime/anime.service';
import { AgeRatingService } from '../dictionaries/services/age-rating.service';
import { GenreService } from '../dictionaries/services/genre.service';
import { Episode } from '../episode/entities/episode.entity';
import { EpisodeService } from '../episode/episode.service';
import { AnimeReleaseGenreService } from './anime-release-genre.service';
import { GetAnimeListDto } from './dto/anime-release.dto';
import { AnimeRelease, ReleaseType } from './entities/anime-release.entity';
import {
  AniLibriaAnime,
  AniLibriaApiResponse,
  AniLibriaFranchiseResponse,
  AniLibriaScheduleEpisode,
  AniLibriaScheduleItem,
  AniLibriaScheduleResponse,
} from './types/anilibria-api.types';

dotenv.config();
const configService = new ConfigService();

@Injectable()
export class AnimeReleaseService {
  constructor(
    @InjectRepository(AnimeRelease)
    private animeReleaseRepo: Repository<AnimeRelease>,
    private animeService: AnimeService,
    private ageRatingService: AgeRatingService,
    private genreService: GenreService,
    private episodeService: EpisodeService,
    private animeGenreService: AnimeReleaseGenreService,
    private httpRetryService: HttpRetryService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private colorExtractorService: ColorExtractorService,
  ) {}

  async syncAllAnime() {
    let page = 1;
    let hasNextPage = true;
    while (hasNextPage) {
      try {
        console.log('START----------------------------------------------START');
        console.info('CURRENT PAGE', page);
        const apiResponse = await this.fetchFromApi<
          AniLibriaApiResponse<AniLibriaAnime>
        >(`/anime/catalog/releases?page=${page}&limit=50`);
        // Сохраняем новые аниме в базу данных
        for (const apiAnime of apiResponse.data) {
          await this.syncSingleAnimeFromApi(apiAnime);
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
        }
        page++;
        hasNextPage = !!apiResponse.meta.pagination.links?.next;
        console.info('HAS NEXT PAGE', hasNextPage);
        console.log('END--------------------------------------------------END');
      } catch (e) {
        page++;
        console.error('ERROR, WHEN TRYING TO FETCH ALL ANIME', e);
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 10000);
      });
    }
  }

  @Cron('0 9,21 * * *') // 9:00 и 21:00 каждый день
  async syncScheduleData() {
    try {
      console.log('Starting schedule synchronization...');

      const scheduleResponse =
        await this.fetchFromApi<AniLibriaScheduleResponse>(
          '/anime/schedule/now',
        );

      console.log('Schedule API Response received');

      // Объединяем все релизы из расписания
      const allScheduleItems = [
        ...(scheduleResponse.today || []),
        ...(scheduleResponse.yesterday || []),
        ...(scheduleResponse.tomorrow || []),
      ];

      console.log(`Processing ${allScheduleItems.length} scheduled releases`);

      // Сначала синхронизируем справочники
      const allReleases = allScheduleItems.map((item) => item.release);
      await this.genreService.syncGenresFromApi(allReleases);
      await this.syncAgeRatings(allReleases);

      // Обрабатываем каждый элемент расписания
      for (const scheduleItem of allScheduleItems) {
        await this.processScheduleItem(scheduleItem);
      }

      console.log('Schedule synchronization completed successfully');
    } catch (error) {
      console.error('Error during schedule synchronization:', error);
    }
  }

  private async processScheduleItem(scheduleItem: AniLibriaScheduleItem) {
    const release = scheduleItem.release;
    console.log(
      `Processing schedule item: ${release.id} - ${release.name?.main || 'No name'}`,
    );

    try {
      // Обрабатываем жанры и возрастные ограничения
      const genreIds = await this.genreService.processGenresFromApi(
        release.genres || [],
      );
      const ageRatingId = await this.processAgeRating(release.age_rating);

      // Ищем существующее аниме
      let anime = await this.animeReleaseRepo.findOne({
        where: { external_id: release.id },
        relations: ['animeGenres', 'animeGenres.genre'],
      });

      if (!anime) {
        // Создаем новое аниме
        anime = this.animeReleaseRepo.create({
          external_id: release.id,
          title_ru: release.name?.main || '',
          title_en: release.name?.english || '',
          description: release.description || '',
          year: release.year || new Date().getFullYear(),
          poster_url:
            release.poster?.optimized?.preview || release.poster?.preview || '',
          alias: release.alias,
          is_blocked_by_geo: release.is_blocked_by_geo || false,
          is_ongoing: release.is_ongoing,
          publish_day: release.publish_day
            ? {
                value: release.publish_day.value,
                description: release.publish_day.description,
              }
            : undefined,
          episodes_total: release.episodes_total || undefined,
          average_duration_of_episode:
            release.average_duration_of_episode || undefined,
          external_created_at: release.created_at
            ? new Date(release.created_at)
            : undefined,
          age_rating_id: ageRatingId,
        });
        console.log(`Created new anime: ${anime.title_ru}`);
      } else {
        // Обновляем существующее аниме
        anime.title_ru = release.name?.main || '';
        anime.title_en = release.name?.english || '';
        anime.description = release.description || '';
        anime.year = release.year || new Date().getFullYear();
        anime.poster_url =
          release.poster?.optimized?.preview || release.poster?.preview || '';
        anime.alias = release.alias;
        anime.is_blocked_by_geo = release.is_blocked_by_geo || false;
        anime.is_ongoing = release.is_ongoing;
        anime.publish_day = release.publish_day
          ? {
              value: release.publish_day.value,
              description: release.publish_day.description,
            }
          : undefined;
        anime.episodes_total = release.episodes_total || undefined;
        anime.average_duration_of_episode =
          release.average_duration_of_episode || undefined;
        anime.external_created_at = release.created_at
          ? new Date(release.created_at)
          : undefined;
        anime.age_rating_id = ageRatingId;
        console.log(
          `Updated existing anime: ${anime.title_ru}, is_ongoing: ${anime.is_ongoing}`,
        );
      }

      // Сохраняем аниме
      await this.animeReleaseRepo.save(anime);

      // Обновляем связи с жанрами
      await this.animeGenreService.updateAnimeGenres(anime.id, genreIds);

      // Получаем данные франшизы для обновления anime
      const franchiseData = await this.getFranchiseData(release.id);
      // Обновляем данные anime на основе франшизы, если данные получены
      if (franchiseData) {
        await this.updateAnimeFromFranchiseData(anime, franchiseData);
      }

      // Обрабатываем эпизод из расписания, если он есть
      if (scheduleItem.published_release_episode) {
        await this.processScheduleEpisode(
          anime,
          scheduleItem.published_release_episode,
        );
      }
    } catch (error) {
      console.error(`Error processing schedule item ${release.id}:`, error);
    }
  }

  private async processScheduleEpisode(
    animeRelease: AnimeRelease,
    episode: AniLibriaScheduleEpisode,
  ) {
    try {
      await this.episodeService.createEpisodeFromSchedule(
        animeRelease,
        episode,
      );
      console.log(
        `Created/updated episode ${episode.ordinal || episode.sort_order} for anime ${animeRelease.title_ru}`,
      );
    } catch (error) {
      console.error(
        `Error processing episode for anime ${animeRelease.id}:`,
        error,
      );
    }
  }

  async getAnimeList(
    query: GetAnimeListDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<AnimeRelease>> {
    // Проверяем кэш (включаем userId в ключ кэша)
    const cacheKey = `anime_list_${JSON.stringify(query)}_${userId || 'anonymous'}`;
    const cachedResult =
      await this.cacheManager.get<PaginatedResponseDto<AnimeRelease>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const localResults = await this.searchInLocalDatabase(query, userId);
    await this.cacheManager.set(cacheKey, localResults, 3600); // 1 час
    return localResults;
  }

  private async searchInLocalDatabase(
    query: GetAnimeListDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<AnimeRelease>> {
    const { search, genre, year, page = 1, limit = 20 } = query;

    const qb = this.animeReleaseRepo
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.episodes', 'episodes')
      .leftJoinAndSelect('anime.animeGenres', 'animeGenres')
      .leftJoinAndSelect('animeGenres.genre', 'genre')
      .leftJoinAndSelect('anime.ageRating', 'ageRating');

    // Если есть авторизованный пользователь, загружаем связь userAnime
    if (userId) {
      qb.leftJoinAndSelect(
        'anime.userAnime',
        'userAnime',
        'userAnime.user_id = :userId',
        { userId },
      );
    }

    if (search) {
      qb.where('anime.title_ru ILIKE :search OR anime.title_en ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (genre) {
      qb.andWhere('genre.name ILIKE :genre', { genre: `%${genre}%` });
    }
    if (year) {
      qb.andWhere('anime.year = :year', { year });
    }

    // Подсчет общего количества
    const total = await qb.getCount();

    // Применяем пагинацию
    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    // Сортировка по году (новые сначала) и названию
    qb.orderBy('anime.year', 'DESC').addOrderBy('anime.title_ru', 'ASC');

    const data = await qb.getMany();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  private async syncSingleAnimeFromApi(
    apiAnime: AniLibriaAnime,
  ): Promise<void> {
    try {
      // Проверяем, есть ли уже такое аниме
      const existingAnime = await this.animeReleaseRepo.findOne({
        where: { external_id: apiAnime.id },
      });

      if (!existingAnime) {
        // Обрабатываем жанры и возрастные ограничения
        const genreIds = await this.genreService.processGenresFromApi(
          apiAnime.genres || [],
        );
        const ageRatingId = await this.processAgeRating(apiAnime.age_rating);
        const accentColors =
          await this.colorExtractorService.extractColorsFromUrl(
            configService.get('PUBLIC_ANILIBRIA_URL') +
              (apiAnime.poster?.optimized?.preview ||
                apiAnime.poster?.preview ||
                apiAnime.poster?.optimized?.thumbnail ||
                apiAnime.poster?.thumbnail ||
                ''),
          );

        // Создаем новое аниме
        const animeRelease = this.animeReleaseRepo.create({
          external_id: apiAnime.id,
          title_ru: apiAnime.name?.main || '',
          title_en: apiAnime.name?.english || '',
          description: apiAnime.description || '',
          year: apiAnime.year || new Date().getFullYear(),
          type: apiAnime.type.value as ReleaseType,
          poster_url:
            apiAnime.poster?.optimized?.preview ||
            apiAnime.poster?.preview ||
            apiAnime.poster?.optimized?.thumbnail ||
            apiAnime.poster?.thumbnail ||
            '',
          accent_colors: accentColors,
          alias: apiAnime.alias,
          is_blocked_by_geo: apiAnime.is_blocked_by_geo || false,
          is_ongoing: apiAnime.is_ongoing || false,
          publish_day: apiAnime.publish_day
            ? {
                value: apiAnime.publish_day.value,
                description: apiAnime.publish_day.description,
              }
            : undefined,
          episodes_total: apiAnime.episodes_total || undefined,
          average_duration_of_episode:
            apiAnime.average_duration_of_episode || undefined,
          external_created_at: apiAnime.created_at
            ? new Date(apiAnime.created_at)
            : undefined,
          age_rating_id: ageRatingId,
        });

        await this.animeReleaseRepo.save(animeRelease);
        await this.animeGenreService.updateAnimeGenres(
          animeRelease.id,
          genreIds,
        );

        const franchiseData = await this.getFranchiseData(apiAnime.id);
        if (franchiseData) {
          await this.updateAnimeFromFranchiseData(animeRelease, franchiseData);
        }

        console.log(`Synced new anime from API: ${animeRelease.title_ru}`);
      }
    } catch (error) {
      console.error(`Error syncing anime ${apiAnime.id} from API:`, error);
    }
  }

  async getAnimeDetails(id: string, userId?: string) {
    const cacheKey = `anime_${id}_${userId || 'anonymous'}`;
    let anime = await this.cacheManager.get<AnimeRelease>(cacheKey);
    if (!anime) {
      const relations = [
        'episodes',
        'animeGenres',
        'animeGenres.genre',
        'ageRating',
      ];

      // Если есть авторизованный пользователь, добавляем связь userAnime
      if (userId) {
        relations.push('userAnime');
      }

      anime =
        (await this.animeReleaseRepo.findOne({
          where: { id },
          relations,
        })) ?? undefined;

      await this.cacheManager.set(cacheKey, anime, 3600);
    }
    return anime;
  }

  async getEpisodes(id: string) {
    const cacheKey = `episodes_anime_${id}`;
    let episodes = await this.cacheManager.get<Episode[]>(cacheKey);
    if (!episodes) {
      episodes = await this.episodeService.getEpisodes(id);
    }
    return episodes;
  }

  // Методы для работы с ограничениями по возрасту
  private async syncAgeRatings(titles: AniLibriaAnime[]) {
    console.log('Syncing age ratings from API...');

    // Собираем все уникальные ограничения по возрасту из всех аниме
    const allAgeRatings = new Map<
      string,
      { value: string; label: string; description: string }
    >();
    titles.forEach((title) => {
      if (title.age_rating && title.age_rating.value) {
        allAgeRatings.set(title.age_rating.value, {
          value: title.age_rating.value,
          label: title.age_rating.label || '',
          description: title.age_rating.description || '',
        });
      }
    });

    console.log(`Found ${allAgeRatings.size} unique age ratings`);

    // Синхронизируем каждое ограничение по возрасту
    for (const [value, ageRatingData] of allAgeRatings) {
      try {
        const existingAgeRating =
          await this.ageRatingService.findByValue(value);
        // Обновляем существующее ограничение по возрасту
        await this.ageRatingService.update(existingAgeRating.id, ageRatingData);
        console.log(`Updated age rating: ${ageRatingData.label}`);
      } catch {
        // Ограничение по возрасту не найдено, создаем новое
        try {
          await this.ageRatingService.create(ageRatingData);
          console.log(`Created new age rating: ${ageRatingData.label}`);
        } catch (createError) {
          console.error(
            `Failed to create age rating ${ageRatingData.label}:`,
            createError,
          );
        }
      }
    }
  }

  private async processAgeRating(
    ageRating: AniLibriaAnime['age_rating'],
  ): Promise<string | undefined> {
    if (!ageRating || !ageRating.value) {
      return undefined;
    }

    try {
      const ageRatingEntity = await this.ageRatingService.findByValue(
        ageRating.value,
      );
      return ageRatingEntity.id;
    } catch (error) {
      console.error(
        `Age rating with value ${ageRating.value} not found:`,
        error,
      );
      return undefined;
    }
  }

  async searchAnime(q: string, userId?: string) {
    const cacheKey = `search_${q}_${userId || 'anonymous'}`;
    let results = await this.cacheManager.get(cacheKey);
    if (!results) {
      const apiResponse = await this.fetchFromApi<
        AniLibriaApiResponse<AniLibriaAnime>
      >(`/app/search/releases?query=${encodeURIComponent(q)}`);

      // Конвертируем результаты API в локальные аниме
      const animeList: AnimeRelease[] = [];
      for (const apiAnime of apiResponse.data) {
        // Ищем существующее аниме в базе
        const relations = ['animeGenres', 'animeGenres.genre', 'ageRating'];

        // Если есть авторизованный пользователь, добавляем связь userAnime
        if (userId) {
          relations.push('userAnime');
        }

        let anime = await this.animeReleaseRepo.findOne({
          where: { external_id: apiAnime.id },
          relations,
        });

        if (!anime) {
          // Создаем новое аниме
          const genreIds = await this.genreService.processGenresFromApi(
            apiAnime.genres || [],
          );
          const ageRatingId = await this.processAgeRating(apiAnime.age_rating);

          anime = this.animeReleaseRepo.create({
            external_id: apiAnime.id,
            title_ru: apiAnime.name.main,
            title_en: apiAnime.name.english || '',
            description: apiAnime.description || '',
            year: apiAnime.year || new Date().getFullYear(),
            poster_url:
              apiAnime.poster?.optimized?.preview ||
              apiAnime.poster?.preview ||
              '',
            alias: apiAnime.alias,
            is_blocked_by_geo: apiAnime.is_blocked_by_geo || false,
            is_ongoing: apiAnime.is_ongoing || false,
            publish_day: apiAnime.publish_day
              ? {
                  value: apiAnime.publish_day.value,
                  description: apiAnime.publish_day.description,
                }
              : undefined,
            episodes_total: apiAnime.episodes_total || undefined,
            average_duration_of_episode:
              apiAnime.average_duration_of_episode || undefined,
            external_created_at: apiAnime.created_at
              ? new Date(apiAnime.created_at)
              : undefined,
            age_rating_id: ageRatingId,
          });
          await this.animeReleaseRepo.save(anime);

          // Создаем связи с жанрами
          await this.animeGenreService.updateAnimeGenres(anime.id, genreIds);

          // Если есть пользователь, загружаем связь userAnime для нового аниме
          if (userId) {
            const animeWithUserRelation = await this.animeReleaseRepo.findOne({
              where: { id: anime.id },
              relations: [
                'animeGenres',
                'animeGenres.genre',
                'ageRating',
                'userAnime',
              ],
            });
            if (animeWithUserRelation) {
              anime = animeWithUserRelation;
            }
          }
        }

        animeList.push(anime);
      }

      results = {
        data: animeList,
        meta: apiResponse.meta,
      };

      await this.cacheManager.set(cacheKey, results, 3600);
    }
    return results;
  }

  /**
   * Обновляет или создает anime на основе данных франшизы
   */
  private async updateAnimeFromFranchiseData(
    animeRelease: AnimeRelease,
    franchiseData: AniLibriaFranchiseResponse,
  ): Promise<void> {
    try {
      // Ищем существующее anime по external_id франшизы
      let anime = await this.animeService.findOneByExternalId(franchiseData.id);

      const firstRelease = animeRelease.sort_order <= 1;
      if (!anime) {
        // Создаем новое anime на основе данных франшизы
        anime = await this.animeService.createFromFranchiseData(
          franchiseData,
          firstRelease ? animeRelease.alias : undefined,
        );
        console.log(`Created new anime from franchise: ${anime.name}`);
      } else {
        // Обновляем существующее anime данными франшизы
        anime = await this.animeService.updateFromFranchiseData(
          anime,
          franchiseData,
        );
        console.log(`Updated existing anime from franchise: ${anime.name}`);
      }

      // Связываем anime-release с anime
      animeRelease.anime_id = anime.id;
      animeRelease.sort_order =
        franchiseData.franchise_releases.find(
          (item) => item.release_id === animeRelease.external_id,
        )?.sort_order ?? 0;
      await this.animeReleaseRepo.save(animeRelease);

      console.log(
        `Linked anime-release ${animeRelease.title_ru} with anime ${anime.name}`,
      );
    } catch (error) {
      console.error(`Error updating anime from franchise data:`, error);
    }
  }

  /**
   * Получает данные франшизы по ID релиза из AniLibria API
   */
  private async getFranchiseData(
    releaseId: number,
  ): Promise<AniLibriaFranchiseResponse | null> {
    try {
      const franchiseData = await this.fetchFromApi<
        AniLibriaFranchiseResponse[]
      >(`/anime/franchises/release/${releaseId}`);

      // API возвращает массив, берем первый элемент
      return franchiseData && franchiseData.length > 0
        ? franchiseData[0]
        : null;
    } catch (error) {
      console.error(
        `Error fetching franchise data for release ${releaseId}:`,
        error,
      );
      return null;
    }
  }

  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    const baseUrl = configService.get('ANILIBRIA_API_URL');
    const url = `${baseUrl}${endpoint}`;
    const response = await this.httpRetryService.get<T>(url);
    return response.data;
  }
}
