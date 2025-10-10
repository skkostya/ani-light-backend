import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimeGenreService } from './anime/anime-genre.service';
import { AnimeService } from './anime/anime.service';
import { AnimeGenre } from './anime/entities/anime-genre.entity';
import { AnimeRating } from './anime/entities/anime-rating.entity';
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
  AnimeGenreService,
  EpisodeService,
];

const CONTROLLERS = [AgeRatingController, GenreController];

@Module({
  imports: [TypeOrmModule.forFeature(ENTITIES)],
  controllers: CONTROLLERS,
  providers: SERVICES,
})
export class CombineModule {}
