import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-store';
import { HttpRetryService } from 'src/common/services/http-retry.service';
import { SecurityAuditService } from 'src/common/services/security-audit.service';
import { AnimeReleaseGenreService } from './anime-release/anime-release-genre.service';
import { AnimeReleaseService } from './anime-release/anime-release.service';
import { AnimeGenre } from './anime-release/entities/anime-release-genre.entity';
import { AnimeRating } from './anime-release/entities/anime-release-rating.entity';
import { AnimeRelease } from './anime-release/entities/anime-release.entity';
import { AnimeController } from './anime/anime.controller';
import { AnimeService } from './anime/anime.service';
import { Anime } from './anime/entities/anime.entity';
import { AgeRatingController } from './dictionaries/controllers/age-rating.controller';
import { GenreController } from './dictionaries/controllers/genre.controller';
import { AgeRating } from './dictionaries/entities/age-rating.entity';
import { Genre } from './dictionaries/entities/genre.entity';
import { AgeRatingService } from './dictionaries/services/age-rating.service';
import { GenreService } from './dictionaries/services/genre.service';
import { CommentReaction } from './episode/entities/comment-reaction.entity';
import { EpisodeComment } from './episode/entities/episode-comment.entity';
import { EpisodeRating } from './episode/entities/episode-rating.entity';
import { Episode } from './episode/entities/episode.entity';
import { EpisodeService } from './episode/episode.service';
import { UserAnime } from './user/entities/user-anime.entity';
import { UserEpisode } from './user/entities/user-episode.entity';
import { User } from './user/entities/user.entity';

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
  HttpRetryService,
  SecurityAuditService,
];

const CONTROLLERS = [AgeRatingController, GenreController, AnimeController];

@Module({
  imports: [
    TypeOrmModule.forFeature(ENTITIES),
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
export class CombineModule {}
