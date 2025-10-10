import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { AgeRatingService } from '../dictionaries/services/age-rating.service';
import { GenreService } from '../dictionaries/services/genre.service';
import { Episode } from '../episode/entities/episode.entity';
import { GetAnimeListDto } from './dto/anime.dto';
import { AnimeGenre } from './entities/anime-genre.entity';
import { Anime } from './entities/anime.entity';
import {
  AniLibriaAnime,
  AniLibriaApiResponse,
  AniLibriaEpisodeResponse,
  AniLibriaGenre,
} from './types/anilibria-api.types';

dotenv.config();
const configService = new ConfigService();

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepo: Repository<Anime>,
    @InjectRepository(Episode)
    private episodeRepo: Repository<Episode>,
    @InjectRepository(AnimeGenre)
    private animeGenreRepo: Repository<AnimeGenre>,
    private ageRatingService: AgeRatingService,
    private genreService: GenreService,
    private httpService: HttpService,
    private httpRetryService: HttpRetryService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Cron('0 0 * * *')
  async syncAnimeData() {
    const response = await this.fetchFromApi<
      AniLibriaApiResponse<AniLibriaAnime>
    >('/anime/catalog/releases');
    console.log('API Response structure:', Object.keys(response));

    // API возвращает { data: [...], meta: {...} }
    const titles = response.data || [];
    console.log(`Processing ${titles.length} titles`);

    // Сначала синхронизируем все жанры и ограничения по возрасту
    await this.syncGenres(titles);
    await this.syncAgeRatings(titles);

    for (const title of titles) {
      console.log('Processing title:', title.id, title.name?.main || 'No name');

      // Обрабатываем жанры - получаем ID жанров из справочника
      const genreIds = await this.processGenres(title.genres || []);
      console.log('Genre IDs:', genreIds);

      // Обрабатываем ограничение по возрасту
      const ageRatingId = await this.processAgeRating(title.age_rating);
      console.log('Age Rating ID:', ageRatingId);

      let anime = await this.animeRepo.findOne({
        where: { external_id: title.id },
        relations: ['animeGenres', 'animeGenres.genre'],
      });

      if (!anime) {
        anime = this.animeRepo.create({
          external_id: title.id,
          title_ru: title.name?.main || '',
          title_en: title.name?.english || '',
          description: title.description || '',
          year: title.year || new Date().getFullYear(),
          poster_url:
            title.poster?.optimized?.preview || title.poster?.preview || '',
          // Новые поля из AniLibria API
          alias: title.alias,
          is_blocked_by_geo: title.is_blocked_by_geo || false,
          is_ongoing: title.is_ongoing || false,
          publish_day: title.publish_day
            ? {
                value: title.publish_day.value,
                description: title.publish_day.description,
              }
            : undefined,
          episodes_total: title.episodes_total || undefined,
          average_duration_of_episode:
            title.average_duration_of_episode || undefined,
          external_created_at: title.created_at
            ? new Date(title.created_at)
            : undefined,
          age_rating_id: ageRatingId,
        });
      } else {
        // Обновляем все поля, включая новые
        anime.title_ru = title.name?.main || '';
        anime.title_en = title.name?.english || '';
        anime.description = title.description || '';
        anime.year = title.year || new Date().getFullYear();
        anime.poster_url =
          title.poster?.optimized?.preview || title.poster?.preview || '';

        // Новые поля из AniLibria API
        anime.alias = title.alias;
        anime.is_blocked_by_geo = title.is_blocked_by_geo || false;
        anime.is_ongoing = title.is_ongoing || false;
        anime.publish_day = title.publish_day
          ? {
              value: title.publish_day.value,
              description: title.publish_day.description,
            }
          : undefined;
        anime.episodes_total = title.episodes_total || undefined;
        anime.average_duration_of_episode =
          title.average_duration_of_episode || undefined;
        anime.external_created_at = title.created_at
          ? new Date(title.created_at)
          : undefined;
        anime.age_rating_id = ageRatingId;
      }

      console.log('Created/Updated anime entity:', anime);
      await this.animeRepo.save(anime);

      // Обновляем связи с жанрами
      await this.updateAnimeGenres(anime.id, genreIds);
      console.log('Saved anime to database');

      // Получаем эпизоды отдельным запросом
      try {
        const episodeResponse =
          await this.fetchFromApi<AniLibriaEpisodeResponse>(
            `/anime/releases/${title.id}`,
          );
        console.log(
          'Episode response structure:',
          Object.keys(episodeResponse),
        );

        if (
          episodeResponse.episodes &&
          Array.isArray(episodeResponse.episodes)
        ) {
          console.log(
            `Processing ${episodeResponse.episodes.length} episodes for anime ${title.id}`,
          );

          for (const ep of episodeResponse.episodes) {
            const episode =
              (await this.episodeRepo.findOne({
                where: {
                  anime: { id: anime.id },
                  number: ep.ordinal || ep.sort_order,
                },
              })) ??
              this.episodeRepo.create({
                anime,
                number: ep.ordinal || ep.sort_order,
                video_url: ep.hls_1080 || ep.hls_720 || ep.hls_480 || '',
                subtitles_url: undefined, // В API нет информации о субтитрах
              });

            console.log('Created episode entity:', episode);
            await this.episodeRepo.save(episode);
          }
        }
      } catch (error) {
        console.error(`Error fetching episodes for anime ${title.id}:`, error);
      }
    }
  }

  async getAnimeList(
    query: GetAnimeListDto,
  ): Promise<PaginatedResponseDto<Anime>> {
    const { search, genre, year, page = 1, limit = 20 } = query;

    const qb = this.animeRepo
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.episodes', 'episodes')
      .leftJoinAndSelect('anime.animeGenres', 'animeGenres')
      .leftJoinAndSelect('animeGenres.genre', 'genre')
      .leftJoinAndSelect('anime.ageRating', 'ageRating');

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

  async getAnimeDetails(id: string) {
    const cacheKey = `anime_${id}`;
    let anime = await this.cacheManager.get<Anime>(cacheKey);
    if (!anime) {
      anime =
        (await this.animeRepo.findOne({
          where: { id },
          relations: [
            'episodes',
            'animeGenres',
            'animeGenres.genre',
            'ageRating',
          ],
        })) ?? undefined;
      if (!anime) {
        const data = await this.fetchFromApi<AniLibriaAnime>(
          `/anime/releases/${id}`,
        );

        // Обрабатываем жанры и ограничение по возрасту
        const genreIds = await this.processGenres(data.genres || []);
        const ageRatingId = await this.processAgeRating(data.age_rating);

        anime = this.animeRepo.create({
          external_id: data.id,
          title_ru: data.name.main,
          title_en: data.name.english || '',
          description: data.description || '',
          year: data.year || new Date().getFullYear(),
          poster_url:
            data.poster?.optimized?.preview || data.poster?.preview || '',
          alias: data.alias,
          is_blocked_by_geo: data.is_blocked_by_geo || false,
          is_ongoing: data.is_ongoing || false,
          publish_day: data.publish_day
            ? {
                value: data.publish_day.value,
                description: data.publish_day.description,
              }
            : undefined,
          episodes_total: data.episodes_total || undefined,
          average_duration_of_episode:
            data.average_duration_of_episode || undefined,
          external_created_at: data.created_at
            ? new Date(data.created_at)
            : undefined,
          age_rating_id: ageRatingId,
        });
        await this.animeRepo.save(anime);

        // Создаем связи с жанрами
        await this.updateAnimeGenres(anime.id, genreIds);
      }
      await this.cacheManager.set(cacheKey, anime, 3600);
    }
    return anime;
  }

  async getEpisodes(id: string) {
    const cacheKey = `episodes_${id}`;
    let episodes = await this.cacheManager.get<Episode[]>(cacheKey);
    if (!episodes) {
      episodes = await this.episodeRepo.find({
        where: { anime: { id } },
        order: { number: 'ASC' },
      });
      await this.cacheManager.set(cacheKey, episodes, 3600);
    }
    return episodes;
  }

  // Методы для работы с жанрами
  private async syncGenres(titles: AniLibriaAnime[]) {
    console.log('Syncing genres from API...');

    // Собираем все уникальные жанры из всех аниме
    const allGenres = new Map<
      number,
      {
        external_id: number;
        name: string;
        image: { optimized_preview: string; preview: string };
      }
    >();
    titles.forEach((title) => {
      if (title.genres && Array.isArray(title.genres)) {
        title.genres.forEach((genre) => {
          if (genre.id && genre.name) {
            allGenres.set(genre.id, {
              external_id: genre.id,
              name: genre.name,
              image: {
                optimized_preview: genre.image?.optimized?.preview || '',
                preview: genre.image?.preview || '',
              },
            });
          }
        });
      }
    });

    console.log(`Found ${allGenres.size} unique genres`);

    // Синхронизируем каждый жанр
    for (const [externalId, genreData] of allGenres) {
      try {
        const existingGenre =
          await this.genreService.findByExternalId(externalId);
        // Обновляем существующий жанр
        await this.genreService.update(existingGenre.id, genreData);
        console.log(`Updated genre: ${genreData.name}`);
      } catch {
        // Жанр не найден, создаем новый
        try {
          await this.genreService.create(genreData);
          console.log(`Created new genre: ${genreData.name}`);
        } catch (createError) {
          console.error(
            `Failed to create genre ${genreData.name}:`,
            createError,
          );
        }
      }
    }
  }

  private async processGenres(genres: AniLibriaGenre[]): Promise<string[]> {
    const genreIds: string[] = [];

    for (const genre of genres) {
      if (genre.id) {
        try {
          const genreEntity = await this.genreService.findByExternalId(
            genre.id,
          );
          genreIds.push(genreEntity.id);
        } catch (error) {
          console.error(`Genre with external ID ${genre.id} not found:`, error);
        }
      }
    }

    return genreIds;
  }

  private async updateAnimeGenres(animeId: string, genreIds: string[]) {
    // Удаляем существующие связи
    await this.animeGenreRepo.delete({ anime_id: animeId });

    // Создаем новые связи
    for (const genreId of genreIds) {
      const animeGenre = this.animeGenreRepo.create({
        anime_id: animeId,
        genre_id: genreId,
      });
      await this.animeGenreRepo.save(animeGenre);
    }

    console.log(
      `Updated ${genreIds.length} genre associations for anime ${animeId}`,
    );
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

  async searchAnime(q: string) {
    const cacheKey = `search_${q}`;
    let results = await this.cacheManager.get(cacheKey);
    if (!results) {
      const apiResponse = await this.fetchFromApi<
        AniLibriaApiResponse<AniLibriaAnime>
      >(`/app/search/releases?query=${encodeURIComponent(q)}`);

      // Конвертируем результаты API в локальные аниме
      const animeList: Anime[] = [];
      for (const apiAnime of apiResponse.data) {
        // Ищем существующее аниме в базе
        let anime = await this.animeRepo.findOne({
          where: { external_id: apiAnime.id },
          relations: ['animeGenres', 'animeGenres.genre', 'ageRating'],
        });

        if (!anime) {
          // Создаем новое аниме
          const genreIds = await this.processGenres(apiAnime.genres || []);
          const ageRatingId = await this.processAgeRating(apiAnime.age_rating);

          anime = this.animeRepo.create({
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
          await this.animeRepo.save(anime);

          // Создаем связи с жанрами
          await this.updateAnimeGenres(anime.id, genreIds);
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

  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    const baseUrl = configService.get('ANILIBRIA_API_URL');
    const url = `${baseUrl}${endpoint}`;
    const response = await this.httpRetryService.get<T>(url);
    return response.data;
  }
}
