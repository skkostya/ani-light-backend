import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { AgeRatingService } from '../dictionaries/services/age-rating.service';
import { GenreService } from '../dictionaries/services/genre.service';
import { Episode } from '../episode/entities/episode.entity';
import { EpisodeService } from '../episode/episode.service';
import { AnimeReleaseGenreService } from './anime-release-genre.service';
import { AnimeReleaseService } from './anime-release.service';
import { AnimeRelease } from './entities/anime-release.entity';

describe('AnimeReleaseService', () => {
  let service: AnimeReleaseService;
  let animeReleaseRepository: jest.Mocked<Repository<AnimeRelease>>;
  let episodeRepository: jest.Mocked<Repository<Episode>>;
  let cacheManager: jest.Mocked<any>;
  let httpRetryService: jest.Mocked<HttpRetryService>;
  let ageRatingService: jest.Mocked<AgeRatingService>;
  let genreService: jest.Mocked<GenreService>;
  let episodeService: jest.Mocked<EpisodeService>;
  let animeReleaseGenreService: jest.Mocked<AnimeReleaseGenreService>;

  const mockAnime: Partial<AnimeRelease> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    external_id: 1,
    title_ru: 'Тестовое аниме',
    title_en: 'Test Anime',
    description: 'Описание тестового аниме',
    animeGenres: [],
    year: 2023,
    poster_url: 'https://example.com/poster.jpg',
  };

  const mockEpisode: Partial<Episode> = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    number: 1,
    video_url: 'https://example.com/video.m3u8',
    subtitles_url: 'https://example.com/subtitles.vtt',
    anime_id: mockAnime.id!,
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue({ id: 'test-anime-id' }),
      save: jest.fn().mockResolvedValue({ id: 'test-anime-id' }),
      createQueryBuilder: jest.fn(),
    };

    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    };

    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnimeReleaseService,
        {
          provide: getRepositoryToken(AnimeRelease),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: HttpRetryService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AgeRatingService,
          useValue: {
            findByValue: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: GenreService,
          useValue: {
            processGenresFromApi: jest.fn(),
            findByName: jest.fn(),
          },
        },
        {
          provide: EpisodeService,
          useValue: {
            getEpisodes: jest.fn(),
            createEpisodeFromSchedule: jest.fn(),
          },
        },
        {
          provide: AnimeReleaseGenreService,
          useValue: {
            updateAnimeGenres: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AnimeReleaseService>(AnimeReleaseService);
    animeReleaseRepository = module.get(getRepositoryToken(AnimeRelease));
    episodeRepository = module.get(getRepositoryToken(Episode));
    cacheManager = module.get(CACHE_MANAGER);
    httpRetryService = module.get(HttpRetryService);
    ageRatingService = module.get(AgeRatingService);
    genreService = module.get(GenreService);
    episodeService = module.get(EpisodeService);
    animeReleaseGenreService = module.get(AnimeReleaseGenreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnimeList', () => {
    it('should return paginated anime list', async () => {
      const query = { page: 1, limit: 20 };
      const mockAnimeList = [mockAnime];
      const totalCount = 1;

      const mockQueryBuilder = animeReleaseRepository.createQueryBuilder();
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(totalCount);
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue(mockAnimeList);

      const result = await service.getAnimeList(query);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toEqual(mockAnimeList);
      expect(result.pagination.total).toBe(totalCount);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should apply search filter', async () => {
      const query = { search: 'test', page: 1, limit: 20 };
      const mockQueryBuilder = animeReleaseRepository.createQueryBuilder();
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(0);
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([]);

      await service.getAnimeList(query);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'anime.title_ru ILIKE :search OR anime.title_en ILIKE :search',
        { search: '%test%' },
      );
    });

    it('should apply genre filter', async () => {
      const query = { genre: 'action', page: 1, limit: 20 };
      const mockQueryBuilder = animeReleaseRepository.createQueryBuilder();
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(0);
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([]);

      await service.getAnimeList(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'genre.name ILIKE :genre',
        { genre: '%action%' },
      );
    });

    it('should apply year filter', async () => {
      const query = { year: 2023, page: 1, limit: 20 };
      const mockQueryBuilder = animeReleaseRepository.createQueryBuilder();
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(0);
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([]);

      await service.getAnimeList(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'anime.year = :year',
        { year: 2023 },
      );
    });
  });

  describe('getAnimeDetails', () => {
    it('should return anime from cache if available', async () => {
      const animeId = mockAnime.id!;
      cacheManager.get.mockResolvedValue(mockAnime);

      const result = await service.getAnimeDetails(animeId);

      expect(result).toEqual(mockAnime);
      expect(cacheManager.get).toHaveBeenCalledWith(`anime_${animeId}`);
      expect(animeReleaseRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch anime from database if not in cache', async () => {
      const animeId = mockAnime.id!;
      cacheManager.get.mockResolvedValue(null);
      animeReleaseRepository.findOne.mockResolvedValue(
        mockAnime as AnimeRelease,
      );

      const result = await service.getAnimeDetails(animeId);

      expect(result).toEqual(mockAnime);
      expect(animeReleaseRepository.findOne).toHaveBeenCalledWith({
        where: { id: animeId },
        relations: [
          'episodes',
          'animeGenres',
          'animeGenres.genre',
          'ageRating',
        ],
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `anime_${animeId}`,
        mockAnime,
        3600,
      );
    });
  });

  describe('getEpisodes', () => {
    it('should return episodes from cache if available', async () => {
      const animeId = mockAnime.id!;
      const mockEpisodes = [mockEpisode];
      cacheManager.get.mockResolvedValue(mockEpisodes);

      const result = await service.getEpisodes(animeId);

      expect(result).toEqual(mockEpisodes);
      expect(cacheManager.get).toHaveBeenCalledWith(
        `episodes_anime_${animeId}`,
      );
    });

    it('should fetch episodes from database if not in cache', async () => {
      const animeId = mockAnime.id!;
      const mockEpisodes = [mockEpisode];
      cacheManager.get.mockResolvedValue(null);
      episodeService.getEpisodes.mockResolvedValue(mockEpisodes as Episode[]);

      const result = await service.getEpisodes(animeId);

      expect(result).toEqual(mockEpisodes);
      expect(episodeService.getEpisodes).toHaveBeenCalledWith(animeId);
      expect(cacheManager.set).toHaveBeenCalledWith(
        `episodes_anime_${animeId}`,
        mockEpisodes,
        3600,
      );
    });
  });

  describe('searchAnime', () => {
    it('should return search results from cache if available', async () => {
      const query = 'test';
      const mockResults = [mockAnime];
      cacheManager.get.mockResolvedValue(mockResults);

      const result = await service.searchAnime(query);

      expect(result).toEqual(mockResults);
      expect(cacheManager.get).toHaveBeenCalledWith(`search_${query}`);
      expect(httpRetryService.get).not.toHaveBeenCalled();
    });

    it('should fetch search results from API if not in cache', async () => {
      const query = 'test';
      const mockApiAnime = {
        id: 1,
        name: { main: 'Test Anime', english: 'Test Anime' },
        description: 'Test description',
        year: 2023,
        poster: { preview: 'test.jpg' },
        genres: [],
        age_rating: { value: 'G' },
        is_ongoing: false,
        is_blocked_by_geo: false,
      };
      const mockApiResponse = { data: [mockApiAnime] };
      cacheManager.get.mockResolvedValue(null);
      httpRetryService.get.mockResolvedValue({
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as any);
      genreService.processGenresFromApi.mockResolvedValue([]);
      ageRatingService.findByValue.mockRejectedValue(new Error('Not found'));

      const result = await service.searchAnime(query);

      expect(result).toEqual({ data: expect.any(Array), meta: undefined });
      expect(httpRetryService.get).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        `search_${query}`,
        expect.any(Object),
        3600,
      );
    });
  });
});
