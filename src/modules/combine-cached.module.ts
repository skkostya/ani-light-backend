import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { HttpRetryService } from '../common/services/http-retry.service';
import { ProfanityFilterService } from '../common/services/profanity-filter.service';
import { AnimeRatingController } from './anime/anime-rating.controller';
import { AnimeRatingService } from './anime/anime-rating.service';
import { AnimeController } from './anime/anime.controller';
import { AnimeService } from './anime/anime.service';
import { AnimeRating } from './anime/entities/anime-rating.entity';
import { Anime } from './anime/entities/anime.entity';
import { CommentReaction } from './episode/entities/comment-reaction.entity';
import { EpisodeComment } from './episode/entities/episode-comment.entity';
import { EpisodeRating } from './episode/entities/episode-rating.entity';
import { Episode } from './episode/entities/episode.entity';
import { EpisodeCommentController } from './episode/episode-comment.controller';
import { EpisodeCommentService } from './episode/episode-comment.service';
import { EpisodeRatingController } from './episode/episode-rating.controller';
import { EpisodeRatingService } from './episode/episode-rating.service';
import { EpisodeController } from './episode/episode.controller';
import { EpisodeService } from './episode/episode.service';
import { UserAnime } from './user/entities/user-anime.entity';
import { UserEpisode } from './user/entities/user-episode.entity';
import { User } from './user/entities/user.entity';
import { UserAnimeController } from './user/user-anime.controller';
import { UserAnimeService } from './user/user-anime.service';
import { UserEpisodeController } from './user/user-episode.controller';
import { UserEpisodeService } from './user/user-episode.service';
import { UserNotificationsController } from './user/user-notifications.controller';
import { UserService } from './user/user.service';

const ENTITIES = [
  Anime,
  Episode,
  User,
  UserAnime,
  UserEpisode,
  EpisodeComment,
  CommentReaction,
  AnimeRating,
  EpisodeRating,
];

const SERVICES = [
  AnimeService,
  EpisodeService,
  UserService,
  UserAnimeService,
  UserEpisodeService,
  EpisodeCommentService,
  EpisodeRatingService,
  AnimeRatingService,
  ProfanityFilterService,
  HttpRetryService,
];

const CONTROLLERS = [
  AnimeController,
  EpisodeController,
  UserAnimeController,
  UserEpisodeController,
  UserNotificationsController,
  EpisodeCommentController,
  EpisodeRatingController,
  AnimeRatingController,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(ENTITIES),
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
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
