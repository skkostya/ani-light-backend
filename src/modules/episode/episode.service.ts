import { HttpService } from '@nestjs/axios';
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
    private httpService: HttpService,
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
        const apiEpisodes = await this.fetchFromApi(
          `/title/${anime.external_id}/episodes?withPlayer=true`,
        );
        for (const ep of apiEpisodes) {
          const episode = this.episodeRepository.create({
            id: uuidv4(),
            anime,
            number: ep.number,
            video_url: ep.player.link,
            video_url_480: ep.player.hls_480 || null,
            video_url_720: ep.player.hls_720 || null,
            video_url_1080: ep.player.hls_1080 || null,
            opening: ep.opening || null,
            ending: ep.ending || null,
            duration: ep.duration || null,
            subtitles_url: ep.subtitles?.url || null,
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

  private async fetchFromApi(endpoint: string) {
    const url = `${this.apiUrl}${endpoint}`;
    const response = await this.httpRetryService.get(url);
    return response.data;
  }
}
