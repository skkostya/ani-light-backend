import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserAnimeDto, UpdateUserAnimeDto } from './dto/user-anime.dto';
import { UserAnime } from './entities/user-anime.entity';
import { UserAnimeService } from './user-anime.service';

describe('UserAnimeService', () => {
  let service: UserAnimeService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAnimeService,
        {
          provide: getRepositoryToken(UserAnime),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserAnimeService>(UserAnimeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user-anime relationship', async () => {
      const userId = 'user-123';
      const createDto: CreateUserAnimeDto = {
        anime_id: 'anime-123',
        is_favorite: true,
        want_to_watch: false,
      };

      const mockUserAnime = {
        id: 'user-anime-123',
        user_id: userId,
        ...createDto,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUserAnime);
      mockRepository.save.mockResolvedValue(mockUserAnime);

      const result = await service.create(userId, createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, anime_id: createDto.anime_id },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        ...createDto,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockUserAnime);
      expect(result).toEqual(mockUserAnime);
    });

    it('should throw ConflictException if relationship already exists', async () => {
      const userId = 'user-123';
      const createDto: CreateUserAnimeDto = {
        anime_id: 'anime-123',
        is_favorite: true,
      };

      mockRepository.findOne.mockResolvedValue({ id: 'existing-123' });

      await expect(service.create(userId, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update existing user-anime relationship', async () => {
      const userId = 'user-123';
      const animeId = 'anime-123';
      const updateDto: UpdateUserAnimeDto = {
        is_favorite: true,
        rating: 8,
      };

      const existingUserAnime = {
        id: 'user-anime-123',
        user_id: userId,
        anime_id: animeId,
        is_favorite: false,
        rating: null,
      };

      const updatedUserAnime = {
        ...existingUserAnime,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingUserAnime);
      mockRepository.save.mockResolvedValue(updatedUserAnime);

      const result = await service.update(userId, animeId, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, anime_id: animeId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result).toEqual(updatedUserAnime);
    });

    it('should throw NotFoundException if relationship does not exist', async () => {
      const userId = 'user-123';
      const animeId = 'anime-123';
      const updateDto: UpdateUserAnimeDto = { is_favorite: true };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, animeId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status for existing relationship', async () => {
      const userId = 'user-123';
      const animeId = 'anime-123';

      const existingUserAnime = {
        id: 'user-anime-123',
        user_id: userId,
        anime_id: animeId,
        is_favorite: false,
      };

      const toggledUserAnime = {
        ...existingUserAnime,
        is_favorite: true,
      };

      mockRepository.findOne.mockResolvedValue(existingUserAnime);
      mockRepository.save.mockResolvedValue(toggledUserAnime);

      const result = await service.toggleFavorite(userId, animeId);

      expect(result.is_favorite).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(toggledUserAnime);
    });

    it('should create new relationship if it does not exist', async () => {
      const userId = 'user-123';
      const animeId = 'anime-123';

      const newUserAnime = {
        id: 'user-anime-123',
        user_id: userId,
        anime_id: animeId,
        is_favorite: true,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUserAnime);
      mockRepository.save.mockResolvedValue(newUserAnime);

      const result = await service.toggleFavorite(userId, animeId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        anime_id: animeId,
        is_favorite: true,
      });
      expect(result).toEqual(newUserAnime);
    });
  });
});
