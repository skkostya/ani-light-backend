import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { Anime } from '../anime/entities/anime.entity';
import {
  AniLibriaAnime,
  AniLibriaScheduleEpisode,
} from '../anime/types/anilibria-api.types';
import { Episode } from './entities/episode.entity';

dotenv.config();
const configService = new ConfigService();

@Injectable()
export class EpisodeService {
  private readonly apiUrl = configService.get('ANILIBRIA_API_URL');

  constructor(
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    private httpRetryService: HttpRetryService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getEpisodes(animeId: string) {
    const cacheKey = `episodes_anime_${animeId}`;
    let episodes = await this.cacheManager.get<Episode[]>(cacheKey);
    if (!episodes) {
      const anime = await this.animeRepository.findOne({
        where: { id: animeId },
      });
      if (!anime)
        throw new NotFoundException(`Anime with ID ${animeId} not found`);
      episodes = await this.episodeRepository.find({
        where: { anime: { id: animeId } },
        order: { number: 'ASC' },
      });
      if (!episodes.length && anime.external_id) {
        const data = await this.fetchFromApi<AniLibriaAnime>(
          `/anime/releases/${anime.external_id}`,
        );
        for (const ep of data.episodes) {
          const episode = this.episodeRepository.create({
            id: uuidv4(),
            anime,
            number: ep.sort_order,
            video_url:
              this.cleanVideoUrl(ep.hls_1080 || ep.hls_720 || ep.hls_480) || '',
            video_url_480: this.cleanVideoUrl(ep.hls_480),
            video_url_720: this.cleanVideoUrl(ep.hls_720),
            video_url_1080: this.cleanVideoUrl(ep.hls_1080),
            opening: ep.opening || null,
            ending: ep.ending || null,
            duration: ep.duration || null,
            preview_image:
              ep.preview?.optimized?.preview || ep.preview?.preview || null,
            subtitles_url: undefined,
          } as Partial<Episode>);
          await this.episodeRepository.save(episode);
        }
        episodes = await this.episodeRepository.find({
          where: { anime: { id: animeId } },
          order: { number: 'ASC' },
        });
      }
      await this.cacheManager.set(cacheKey, episodes, 3600);
    }
    return episodes;
  }

  async getEpisodeDetails(id: string) {
    const cacheKey = `episode_${id}`;
    let episode = await this.cacheManager.get<Episode>(cacheKey);
    if (!episode) {
      episode =
        (await this.episodeRepository.findOne({
          where: { id },
          relations: ['anime'],
        })) || undefined;
      if (!episode)
        throw new NotFoundException(`Episode with ID ${id} not found`);
      await this.cacheManager.set(cacheKey, episode, 3600);
    }
    return episode;
  }

  async createEpisodeFromSchedule(
    anime: Anime,
    episode: AniLibriaScheduleEpisode,
  ): Promise<Episode> {
    // Проверяем, есть ли уже такой эпизод
    const existingEpisode = await this.episodeRepository.findOne({
      where: {
        anime: { id: anime.id },
        number: episode.ordinal || episode.sort_order,
      },
    });

    if (existingEpisode) {
      return existingEpisode;
    }

    // Создаем новый эпизод
    const newEpisode = this.episodeRepository.create({
      anime: anime,
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
