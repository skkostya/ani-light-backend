import { INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { ProfanityFilterService } from '../src/common/services/profanity-filter.service';
import { AnimeRatingController } from '../src/modules/anime/anime-rating.controller';
import { AnimeRatingService } from '../src/modules/anime/anime-rating.service';
import { AnimeRating } from '../src/modules/anime/entities/anime-rating.entity';
import { Anime } from '../src/modules/anime/entities/anime.entity';
import { CommentReaction } from '../src/modules/episode/entities/comment-reaction.entity';
import { EpisodeComment } from '../src/modules/episode/entities/episode-comment.entity';
import { EpisodeRating } from '../src/modules/episode/entities/episode-rating.entity';
import { Episode } from '../src/modules/episode/entities/episode.entity';
import { EpisodeCommentController } from '../src/modules/episode/episode-comment.controller';
import { EpisodeCommentService } from '../src/modules/episode/episode-comment.service';
import { EpisodeRatingController } from '../src/modules/episode/episode-rating.controller';
import { EpisodeRatingService } from '../src/modules/episode/episode-rating.service';
import { UserAnime } from '../src/modules/user/entities/user-anime.entity';
import { UserEpisode } from '../src/modules/user/entities/user-episode.entity';
import { User } from '../src/modules/user/entities/user.entity';
import { UserAnimeController } from '../src/modules/user/user-anime.controller';
import { UserAnimeService } from '../src/modules/user/user-anime.service';
import { UserEpisodeController } from '../src/modules/user/user-episode.controller';
import { UserEpisodeService } from '../src/modules/user/user-episode.service';

describe('User Relationships (e2e)', () => {
  let app: INestApplication;

  const testAnime = {
    id: 'test-anime-123',
    title_ru: 'Тестовое аниме',
    title_en: 'Test Anime',
    description: 'Описание тестового аниме',
    animeGenres: [],
    year: 2024,
    poster_url: 'https://example.com/poster.jpg',
  };

  const testEpisode = {
    id: 'test-episode-123',
    anime_id: 'test-anime-123',
    number: 1,
    video_url: 'https://example.com/video.mp4',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            User,
            Anime,
            Episode,
            UserAnime,
            UserEpisode,
            EpisodeComment,
            CommentReaction,
            AnimeRating,
            EpisodeRating,
          ],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          User,
          Anime,
          Episode,
          UserAnime,
          UserEpisode,
          EpisodeComment,
          CommentReaction,
          AnimeRating,
          EpisodeRating,
        ]),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [
        UserAnimeController,
        UserEpisodeController,
        EpisodeCommentController,
        AnimeRatingController,
        EpisodeRatingController,
      ],
      providers: [
        UserAnimeService,
        UserEpisodeService,
        EpisodeCommentService,
        AnimeRatingService,
        EpisodeRatingService,
        ProfanityFilterService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user/anime (POST)', () => {
    it('should create user-anime relationship', () => {
      return request(app.getHttpServer())
        .post('/user/anime')
        .send({
          anime_id: testAnime.id,
          is_favorite: true,
          want_to_watch: false,
          rating: 8,
        })
        .expect(201);
    });

    it('should toggle favorite status', () => {
      return request(app.getHttpServer())
        .post(`/user/anime/${testAnime.id}/toggle-favorite`)
        .expect(201);
    });
  });

  describe('/user/episodes (POST)', () => {
    it('should create user-episode relationship', () => {
      return request(app.getHttpServer())
        .post('/user/episodes')
        .send({
          episode_id: testEpisode.id,
          status: 'watching',
          rating: 7,
        })
        .expect(201);
    });

    it('should mark episode as watched', () => {
      return request(app.getHttpServer())
        .post(`/user/episodes/${testEpisode.id}/mark-watched`)
        .send({
          watched_until_end: true,
        })
        .expect(201);
    });
  });

  describe('/episodes/:episodeId/comments (POST)', () => {
    it('should create episode comment', () => {
      return request(app.getHttpServer())
        .post(`/episodes/${testEpisode.id}/comments`)
        .send({
          content: 'Отличный эпизод!',
        })
        .expect(201);
    });

    it('should reject comment with profanity', () => {
      return request(app.getHttpServer())
        .post(`/episodes/${testEpisode.id}/comments`)
        .send({
          content: 'блядь отличный эпизод',
        })
        .expect(400);
    });
  });

  describe('/anime/:animeId/ratings (POST)', () => {
    it('should create anime rating', () => {
      return request(app.getHttpServer())
        .post(`/anime/${testAnime.id}/ratings`)
        .send({
          rating: 9,
        })
        .expect(201);
    });
  });

  describe('/episodes/:episodeId/ratings (POST)', () => {
    it('should create episode rating', () => {
      return request(app.getHttpServer())
        .post(`/episodes/${testEpisode.id}/ratings`)
        .send({
          rating: 8,
        })
        .expect(201);
    });
  });
});
