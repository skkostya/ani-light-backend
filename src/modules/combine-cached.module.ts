import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { ColorExtractorService } from 'src/common/services/color-extractor.service';
import { SecurityAuditService } from 'src/common/services/security-audit.service';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { OptionalUserGuard } from '../common/guards/optional-user.guard';
import { HttpRetryService } from '../common/services/http-retry.service';
import { ProfanityFilterService } from '../common/services/profanity-filter.service';
import { AnimeReleaseGenreService } from './anime-release/anime-release-genre.service';
import { AnimeReleaseRatingController } from './anime-release/anime-release-rating.controller';
import { AnimeReleaseRatingService } from './anime-release/anime-release-rating.service';
import { AnimeReleaseController } from './anime-release/anime-release.controller';
import { AnimeReleaseService } from './anime-release/anime-release.service';
import { AnimeGenre } from './anime-release/entities/anime-release-genre.entity';
import { AnimeRating } from './anime-release/entities/anime-release-rating.entity';
import { AnimeRelease } from './anime-release/entities/anime-release.entity';
import { AnimeController } from './anime/anime.controller';
import { AnimeService } from './anime/anime.service';
import { Anime } from './anime/entities/anime.entity';
import { AgeRating } from './dictionaries/entities/age-rating.entity';
import { Genre } from './dictionaries/entities/genre.entity';
import { AgeRatingService } from './dictionaries/services/age-rating.service';
import { GenreService } from './dictionaries/services/genre.service';
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
import { TelegramBotController } from './telegram/controllers/telegram-bot.controller';
import { TelegramBotService } from './telegram/services/telegram-bot.service';
import { TelegramService } from './telegram/services/telegram.service';
import { UserAnime } from './user/entities/user-anime.entity';
import { UserEpisode } from './user/entities/user-episode.entity';
import { User } from './user/entities/user.entity';
import { UserAnimeController } from './user/user-anime.controller';
import { UserAnimeService } from './user/user-anime.service';
import { UserEpisodeController } from './user/user-episode.controller';
import { UserEpisodeService } from './user/user-episode.service';
import { UserNotificationsController } from './user/user-notifications.controller';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

const ENTITIES = [
  Anime,
  AnimeRelease,
  AnimeGenre,
  AnimeRating,
  Episode,
  EpisodeComment,
  EpisodeRating,
  CommentReaction,
  User,
  UserAnime,
  UserEpisode,
  AgeRating,
  Genre,
];

const SERVICES = [
  AgeRatingService,
  GenreService,
  AnimeService,
  AnimeReleaseService,
  AnimeReleaseGenreService,
  EpisodeService,
  UserService,
  UserAnimeService,
  UserEpisodeService,
  EpisodeCommentService,
  EpisodeRatingService,
  AnimeReleaseRatingService,
  ProfanityFilterService,
  HttpRetryService,
  SecurityAuditService,
  OptionalUserGuard,
  ColorExtractorService,
  TelegramService,
  TelegramBotService,
  JwtStrategy,
];

const CONTROLLERS = [
  AnimeController,
  AnimeReleaseController,
  EpisodeController,
  UserController,
  UserAnimeController,
  UserEpisodeController,
  UserNotificationsController,
  EpisodeCommentController,
  EpisodeRatingController,
  AnimeReleaseRatingController,
  TelegramBotController,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(ENTITIES),
    HttpModule,
    PassportModule,
    CacheModule.registerAsync({
      useFactory: () => {
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = process.env.REDIS_PORT || 6379;
        const useRedis = process.env.REDIS_ENABLED !== 'false';

        // Если Redis отключен, используем in-memory cache
        if (!useRedis) {
          return {
            ttl: 3600, // Кэш на 1 час
          } as any;
        }

        // Используем Redis с опциями для предотвращения блокировки
        return {
          store: redisStore as any,
          host: redisHost,
          port: Number(redisPort),
          ttl: 3600, // Кэш на 1 час
          // Опции для предотвращения блокировки при недоступности Redis
          retryStrategy: (times: number) => {
            if (times > 3) {
              // После 3 попыток переключаемся на in-memory
              return null;
            }
            return Math.min(times * 50, 2000);
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: false, // Не проверяем готовность при старте
          lazyConnect: true, // Подключаемся лениво
        } as any;
      },
    }),
  ],
  controllers: CONTROLLERS,
  providers: SERVICES,
})
export class CombineCachedModule {}
