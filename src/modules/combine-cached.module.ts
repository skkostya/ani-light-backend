import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { HttpRetryService } from '../common/services/http-retry.service';
import { AnimeController } from './anime/anime.controller';
import { AnimeService } from './anime/anime.service';
import { Anime } from './anime/entities/anime.entity';
import { Episode } from './episode/entities/episode.entity';
import { EpisodeController } from './episode/episode.controller';
import { EpisodeService } from './episode/episode.service';

const ENTITIES = [Anime, Episode];

const SERVICES = [AnimeService, EpisodeService, HttpRetryService];

const CONTROLLERS = [AnimeController, EpisodeController];

@Module({
  imports: [
    TypeOrmModule.forFeature(ENTITIES),
    HttpModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 3600, // Кэш на 1 час
    }),
  ],
  controllers: CONTROLLERS,
  providers: SERVICES,
})
export class CombineCachedModule {}
