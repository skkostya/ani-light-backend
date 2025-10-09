import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import * as dotenv from 'dotenv';
// import { lastValueFrom } from 'rxjs'; // Не используется с HttpRetryService
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

  @Cron('0 0 * * *') // Ежедневно в полночь
  async syncEpisodesData() {
    const animes = await this.animeRepository.find();
    for (const anime of animes) {
      if (!anime.external_id) continue; // Пропускаем, если нет external_id
      const apiEpisodes = await this.fetchFromApi(
        `/title/${anime.external_id}/episodes?withPlayer=true`,
      );
      for (const ep of apiEpisodes) {
        const episode =
          (await this.episodeRepository.findOne({
            where: { anime: { id: anime.id }, number: ep.number },
          })) ??
          this.episodeRepository.create({
            id: uuidv4(),
            anime,
            number: ep.number,
            video_url: ep.player.link,
            subtitles_url: ep.subtitles?.url || null,
          });
        await this.episodeRepository.save(episode);
      }
      // Обновляем кэш после синхронизации
      const cacheKey = `episodes_anime_${anime.id}`;
      const episodes = await this.episodeRepository.find({
        where: { anime: { id: anime.id } },
        order: { number: 'ASC' },
      });
      await this.cacheManager.set(cacheKey, episodes, 3600);
    }
  }

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
            subtitles_url: ep.subtitles?.url || null,
          });
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
