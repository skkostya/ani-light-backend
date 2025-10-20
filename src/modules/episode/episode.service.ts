import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { AnimeRelease } from '../anime-release/entities/anime-release.entity';
import { AniLibriaScheduleEpisode } from '../anime-release/types/anilibria-api.types';
import { AniLibriaReleaseResponse } from './dto/anilibria-release-response.dto';
import { Episode } from './entities/episode.entity';

dotenv.config();
const configService = new ConfigService();

@Injectable()
export class EpisodeService {
  private readonly apiUrl = configService.get('ANILIBRIA_API_URL');

  constructor(
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(AnimeRelease)
    private animeReleaseRepository: Repository<AnimeRelease>,
    private httpRetryService: HttpRetryService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getEpisodes(animeId: string, userId?: string) {
    const cacheKey = `episodes_anime_${animeId}_${userId || 'anonymous'}`;
    let episodes = await this.cacheManager.get<Episode[]>(cacheKey);
    if (!episodes) {
      // Проверяем, что anime-release существует (animeId на самом деле это anime_release_id)
      const animeRelease = await this.animeReleaseRepository.findOne({
        where: { id: animeId },
      });
      if (!animeRelease)
        throw new NotFoundException(
          `Anime release with ID ${animeId} not found`,
        );

      // Создаем QueryBuilder для получения эпизодов конкретного релиза
      const qb = this.episodeRepository
        .createQueryBuilder('episode')
        .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
        .where('episode.anime_release_id = :animeId', { animeId })
        .orderBy('episode.number', 'ASC');

      // Если есть авторизованный пользователь, добавляем связь userEpisodes с фильтрацией
      if (userId) {
        qb.leftJoinAndSelect(
          'episode.userEpisodes',
          'userEpisodes',
          'userEpisodes.user_id = :userId',
          { userId },
        );
      }

      episodes = await qb.getMany();

      // Если эпизодов нет в базе данных, запрашиваем их с AniLibria API
      if (episodes.length === 0 && animeRelease.external_id) {
        try {
          const apiResponse = await this.fetchReleaseFromApi(
            animeRelease.external_id,
          );
          episodes = await this.createEpisodesFromApiResponse(
            { ...animeRelease, episodes },
            apiResponse,
          );

          // Обновляем кэш с новыми данными
          await this.cacheManager.set(cacheKey, episodes, 3600);
        } catch (error) {
          console.error('Failed to fetch episodes from AniLibria API:', error);
          // Возвращаем пустой массив, если не удалось получить данные с API
        }
      } else {
        await this.cacheManager.set(cacheKey, episodes, 3600);
      }
    }
    return episodes;
  }

  async getEpisodeDetails(id: string, userId?: string) {
    const cacheKey = `episode_${id}_${userId || 'anonymous'}`;
    let episode = await this.cacheManager.get<Episode>(cacheKey);
    if (!episode) {
      // Создаем QueryBuilder
      const qb = this.episodeRepository
        .createQueryBuilder('episode')
        .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
        .where('episode.id::text = :id', { id });

      // Если есть авторизованный пользователь, добавляем связь userEpisodes с фильтрацией
      if (userId) {
        qb.leftJoinAndSelect(
          'episode.userEpisodes',
          'userEpisodes',
          'userEpisodes.user_id = :userId',
          { userId },
        );
      }

      episode = (await qb.getOne()) || undefined;
      if (!episode)
        throw new NotFoundException(`Episode with ID ${id} not found`);

      await this.cacheManager.set(cacheKey, episode, 3600);
    }
    return episode;
  }

  async getEpisodeByNumber(
    alias: string,
    seasonNumber: number,
    episodeNumber: number,
    userId?: string,
  ) {
    const cacheKey = `episode_anime_${alias}_season_${seasonNumber}_number_${episodeNumber}_${userId || 'anonymous'}`;
    let episode = await this.cacheManager.get<Episode>(cacheKey);
    if (!episode) {
      // Создаем QueryBuilder
      const qb = this.episodeRepository
        .createQueryBuilder('episode')
        .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
        .leftJoinAndSelect('animeRelease.anime', 'anime')
        .where('anime.alias = :alias', { alias })
        .andWhere('animeRelease.sort_order = :seasonNumber', { seasonNumber })
        .andWhere('episode.number = :episodeNumber', { episodeNumber });

      // Если есть авторизованный пользователь, добавляем связь userEpisodes с фильтрацией
      if (userId) {
        qb.leftJoinAndSelect(
          'episode.userEpisodes',
          'userEpisodes',
          'userEpisodes.user_id = :userId',
          { userId },
        );
      }

      episode = (await qb.getOne()) || undefined;
      if (!episode) {
        throw new NotFoundException(
          `Episode with number ${episodeNumber} for anime ${alias} season ${seasonNumber} not found`,
        );
      }

      await this.cacheManager.set(cacheKey, episode, 3600);
    }
    return episode;
  }

  async createEpisodeFromSchedule(
    animeRelease: AnimeRelease,
    episode: AniLibriaScheduleEpisode,
  ): Promise<Episode> {
    // Проверяем, есть ли уже такой эпизод
    const existingEpisode = await this.episodeRepository.findOne({
      where: {
        animeRelease: { id: animeRelease.id },
        number: episode.ordinal || episode.sort_order,
      },
    });

    if (existingEpisode) {
      return existingEpisode;
    }

    // Создаем новый эпизод
    const newEpisode = this.episodeRepository.create({
      anime_release_id: animeRelease.id,
      animeRelease: animeRelease,
      number: episode.ordinal || episode.sort_order,
      video_url:
        this.cleanVideoUrl(
          episode.hls_1080 || episode.hls_720 || episode.hls_480,
        ) || '',
      video_url_480: this.cleanVideoUrl(episode.hls_480),
      video_url_720: this.cleanVideoUrl(episode.hls_720),
      video_url_1080: this.cleanVideoUrl(episode.hls_1080),
      opening: episode.opening || null,
      ending: episode.ending || null,
      duration: episode.duration || null,
      preview_image:
        episode.preview?.optimized?.preview || episode.preview?.preview || null,
      subtitles_url: undefined, // В API расписания нет информации о субтитрах
    } as Partial<Episode>);

    return await this.episodeRepository.save(newEpisode);
  }

  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const response = await this.httpRetryService.get(url);
    return response.data;
  }

  /**
   * Запрашивает данные релиза с AniLibria API
   */
  private async fetchReleaseFromApi(
    externalId: number,
  ): Promise<AniLibriaReleaseResponse> {
    const endpoint = `/anime/releases/${externalId}`;
    return await this.fetchFromApi<AniLibriaReleaseResponse>(endpoint);
  }

  /**
   * Создает эпизоды из ответа AniLibria API
   */
  private async createEpisodesFromApiResponse(
    animeRelease: AnimeRelease,
    apiResponse: AniLibriaReleaseResponse,
  ): Promise<Episode[]> {
    if (!apiResponse.episodes || apiResponse.episodes.length === 0) {
      return [];
    }

    const episodes: Episode[] = [];

    for (const apiEpisode of apiResponse.episodes) {
      // Проверяем, есть ли уже такой эпизод
      const existingEpisode = await this.episodeRepository.findOne({
        where: {
          animeRelease: { id: animeRelease.id },
          number: apiEpisode.ordinal || apiEpisode.sort_order,
        },
      });

      if (existingEpisode) {
        episodes.push(existingEpisode);
        continue;
      }

      // Создаем новый эпизод
      const newEpisode = this.episodeRepository.create({
        anime_release_id: animeRelease.id,
        animeRelease: animeRelease,
        number: apiEpisode.ordinal || apiEpisode.sort_order,
        video_url:
          this.cleanVideoUrl(
            apiEpisode.hls_1080 || apiEpisode.hls_720 || apiEpisode.hls_480,
          ) || '',
        video_url_480: this.cleanVideoUrl(apiEpisode.hls_480),
        video_url_720: this.cleanVideoUrl(apiEpisode.hls_720),
        video_url_1080: this.cleanVideoUrl(apiEpisode.hls_1080),
        opening: apiEpisode.opening || null,
        ending: apiEpisode.ending || null,
        duration: apiEpisode.duration || null,
        preview_image:
          apiEpisode.preview?.optimized?.preview ||
          apiEpisode.preview?.preview ||
          null,
        subtitles_url: undefined, // В API нет информации о субтитрах
      } as Partial<Episode>);

      const savedEpisode = await this.episodeRepository.save(newEpisode);
      episodes.push(savedEpisode);
    }

    return episodes;
  }

  /**
   * Очищает URL от параметров isAuthorized, isWithVideoAds, isWithVideoAdsAlways
   * @param url - исходный URL
   * @returns очищенный URL
   */
  private cleanVideoUrl(url: string | null): string | null {
    if (!url) return null;

    // Регулярное выражение для удаления параметров isAuthorized, isWithVideoAds, isWithVideoAdsAlways
    // с любыми значениями
    let cleanUrl = url
      .replace(/[?&]isAuthorized=[^&]*/g, '')
      .replace(/[?&]isWithVideoAds=[^&]*/g, '')
      .replace(/[?&]isWithVideoAdsAlways=[^&]*/g, '');

    // Исправляем случаи, когда первый параметр был удален и остался & вместо ?
    cleanUrl = cleanUrl.replace(/^([^?]*)&/, '$1?');

    // Удаляем оставшиеся ? или & в конце
    cleanUrl = cleanUrl.replace(/[?&]$/, '');

    return cleanUrl;
  }
}
