import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import {
  CreateUserAnimeDto,
  GetUserAnimeListDto,
  PaginatedUserAnimeWithRelationsResponseDto,
  UpdateUserAnimeDto,
} from './dto/user-anime.dto';
import { UserAnime } from './entities/user-anime.entity';

@Injectable()
export class UserAnimeService {
  constructor(
    @InjectRepository(UserAnime)
    private userAnimeRepository: Repository<UserAnime>,
  ) {}

  async create(
    userId: string,
    createDto: CreateUserAnimeDto,
  ): Promise<UserAnime> {
    // Проверяем, не существует ли уже связь
    const existing = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: createDto.anime_id },
    });

    if (existing) {
      throw new ConflictException('Связь пользователя с аниме уже существует');
    }

    const userAnime = this.userAnimeRepository.create({
      user_id: userId,
      ...createDto,
    });

    return this.userAnimeRepository.save(userAnime);
  }

  async update(
    userId: string,
    animeId: string,
    updateDto: UpdateUserAnimeDto,
  ): Promise<UserAnime> {
    const userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
    });

    if (!userAnime) {
      throw new NotFoundException('Связь пользователя с аниме не найдена');
    }

    Object.assign(userAnime, updateDto);
    return this.userAnimeRepository.save(userAnime);
  }

  async findOne(userId: string, animeId: string): Promise<UserAnime> {
    const userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
      relations: ['anime', 'user'],
    });

    if (!userAnime) {
      throw new NotFoundException('Связь пользователя с аниме не найдена');
    }

    return userAnime;
  }

  async findByUser(userId: string): Promise<UserAnime[]> {
    return this.userAnimeRepository.find({
      where: { user_id: userId },
      relations: ['anime'],
      order: { created_at: 'DESC' },
    });
  }

  async findByAnime(animeId: string): Promise<UserAnime[]> {
    return this.userAnimeRepository.find({
      where: { anime_id: animeId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getFavorites(
    userId: string,
    pagination: GetUserAnimeListDto,
  ): Promise<PaginatedUserAnimeWithRelationsResponseDto> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.userAnimeRepository.findAndCount({
      where: { user_id: userId, is_favorite: true },
      relations: [
        'anime',
        'anime.animeReleases',
        'anime.animeReleases.animeGenres',
        'anime.animeReleases.animeGenres.genre',
      ],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(
      data,
      total,
      page,
      limit,
    ) as PaginatedUserAnimeWithRelationsResponseDto;
  }

  async getWantToWatch(
    userId: string,
    pagination: GetUserAnimeListDto,
  ): Promise<PaginatedUserAnimeWithRelationsResponseDto> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.userAnimeRepository.findAndCount({
      where: { user_id: userId, want_to_watch: true },
      relations: [
        'anime',
        'anime.animeReleases',
        'anime.animeReleases.animeGenres',
        'anime.animeReleases.animeGenres.genre',
      ],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(
      data,
      total,
      page,
      limit,
    ) as PaginatedUserAnimeWithRelationsResponseDto;
  }

  async remove(userId: string, animeId: string): Promise<void> {
    const result = await this.userAnimeRepository.delete({
      user_id: userId,
      anime_id: animeId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Связь пользователя с аниме не найдена');
    }
  }

  async toggleFavorite(userId: string, animeId: string): Promise<UserAnime> {
    const userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
    });

    if (!userAnime) {
      // Создаем новую связь с избранным
      return this.create(userId, {
        anime_id: animeId,
        is_favorite: true,
      });
    }

    userAnime.is_favorite = !userAnime.is_favorite;
    return this.userAnimeRepository.save(userAnime);
  }

  async toggleWantToWatch(userId: string, animeId: string): Promise<UserAnime> {
    const userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
    });

    if (!userAnime) {
      // Создаем новую связь со списком просмотра
      return this.create(userId, {
        anime_id: animeId,
        want_to_watch: true,
      });
    }

    userAnime.want_to_watch = !userAnime.want_to_watch;
    return this.userAnimeRepository.save(userAnime);
  }
}
