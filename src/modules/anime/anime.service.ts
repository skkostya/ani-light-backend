import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';
// import { lastValueFrom } from 'rxjs'; // Не используется с HttpRetryService
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { Episode } from '../episode/entities/episode.entity';
import { GetAnimeListDto } from './dto/anime.dto';
import { Anime } from './entities/anime.entity';

dotenv.config();
const configService = new ConfigService();

@Injectable()
export class AnimeService {
  constructor(
    @InjectRepository(Anime)
    private animeRepo: Repository<Anime>,
    @InjectRepository(Episode)
    private episodeRepo: Repository<Episode>,
    private httpService: HttpService,
    private httpRetryService: HttpRetryService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Cron('0 0 * * *')
  async syncAnimeData() {
    const response = await this.fetchFromApi('/anime/catalog/releases');
    console.log('API Response structure:', Object.keys(response));

    // API возвращает { data: [...], meta: {...} }
    const titles = response.data || [];
    console.log(`Processing ${titles.length} titles`);

    for (const title of titles) {
      console.log('Processing title:', title.id, title.name?.main || 'No name');

      // Обрабатываем жанры - извлекаем только названия
      const genres = title.genres?.map((genre) => genre.name) || [];
      console.log('Genres:', genres);

      const anime =
        (await this.animeRepo.findOne({ where: { external_id: title.id } })) ??
        this.animeRepo.create({
          external_id: title.id,
          title_ru: title.name?.main || '',
          title_en: title.name?.english || '',
          description: title.description || '',
          genres: genres,
          year: title.year || new Date().getFullYear(),
          poster_url:
            title.poster?.optimized?.preview || title.poster?.preview || '',
        });

      console.log('Created anime entity:', anime);
      await this.animeRepo.save(anime);
      console.log('Saved anime to database');

      // Получаем эпизоды отдельным запросом
      try {
        const episodeResponse = await this.fetchFromApi(
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
      .leftJoinAndSelect('anime.episodes', 'episodes');

    if (search) {
      qb.where('anime.title_ru ILIKE :search OR anime.title_en ILIKE :search', {
        search: `%${search}%`,
      });
    }
    if (genre) {
      qb.andWhere(':genre = ANY(anime.genres)', { genre });
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
          relations: ['episodes'],
        })) ?? undefined;
      if (!anime) {
        const data = await this.fetchFromApi(`/anime/releases/${id}`);
        anime = this.animeRepo.create({
          external_id: data.id,
          title_ru: data.names.ru,
          title_en: data.names.en || '',
          description: data.description || '',
          genres: data.genres || [],
          year: data.season.year,
          poster_url: data.posters.original.url,
        });
        await this.animeRepo.save(anime);
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

  async searchAnime(q: string) {
    const cacheKey = `search_${q}`;
    let results = await this.cacheManager.get(cacheKey);
    if (!results) {
      results = await this.fetchFromApi(
        `/app/search/releases?query=${encodeURIComponent(q)}`,
      );
      await this.cacheManager.set(cacheKey, results, 3600);
    }
    return results;
  }

  private async fetchFromApi(endpoint: string) {
    const baseUrl = configService.get('ANILIBRIA_API_URL');
    const url = `${baseUrl}${endpoint}`;
    const response = await this.httpRetryService.get(url);
    return response.data;
  }
}
