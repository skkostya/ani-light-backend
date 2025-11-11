import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Anime } from '../anime/entities/anime.entity';
import { Episode } from '../episode/entities/episode.entity';
import {
  CreateUserAnimeDto,
  GetUserAnimeListDto,
  NextEpisodeResponseDto,
  PaginatedUserAnimeWithRelationsResponseDto,
  UpdateUserAnimeDto,
} from './dto/user-anime.dto';
import { UserAnime } from './entities/user-anime.entity';
import { UserEpisodeService } from './user-episode.service';

@Injectable()
export class UserAnimeService {
  constructor(
    @InjectRepository(UserAnime)
    private userAnimeRepository: Repository<UserAnime>,
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    private userEpisodeService: UserEpisodeService,
  ) {}

  async create(
    userId: string,
    createDto: CreateUserAnimeDto,
  ): Promise<UserAnime> {
    // Проверяем существование аниме
    const anime = await this.animeRepository.findOne({
      where: { id: createDto.anime_id },
    });

    if (!anime) {
      throw new NotFoundException(
        `Аниме с ID ${createDto.anime_id} не найдено`,
      );
    }

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
    // Проверяем существование аниме перед созданием связи
    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
    });

    if (!anime) {
      throw new NotFoundException(`Аниме с ID ${animeId} не найдено`);
    }

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
    // Проверяем существование аниме перед созданием связи
    const anime = await this.animeRepository.findOne({
      where: { id: animeId },
    });

    if (!anime) {
      throw new NotFoundException(`Аниме с ID ${animeId} не найдено`);
    }

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

  /**
   * Получает аниме, которые пользователь сейчас смотрит
   */
  async getCurrentlyWatchingAnime(userId: string): Promise<UserAnime[]> {
    return this.userAnimeRepository.find({
      where: { user_id: userId, is_watching: true },
      relations: [
        'anime',
        'lastWatchedEpisode',
        'lastWatchedEpisode.animeRelease',
      ],
      order: { last_watched_at: 'DESC' },
    });
  }

  /**
   * Получает историю просмотра аниме пользователя
   */
  async getWatchHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<UserAnime>> {
    const [data, total] = await this.userAnimeRepository.findAndCount({
      where: {
        user_id: userId,
        last_watched_episode_id: MoreThan(''), // Есть хотя бы один просмотренный эпизод
      },
      relations: ['anime', 'lastWatchedEpisode'],
      order: { last_watched_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * Получает следующие эпизоды для всех просматриваемых аниме пользователя
   */
  async getNextEpisodesForWatchingAnime(
    userId: string,
  ): Promise<NextEpisodeResponseDto[]> {
    // Получаем все просматриваемые аниме
    const watchingAnime = await this.userAnimeRepository.find({
      where: { user_id: userId, is_watching: true },
      relations: ['anime'],
    });

    const result: NextEpisodeResponseDto[] = [];

    for (const userAnime of watchingAnime) {
      let nextEpisode: Episode | null = null;

      if (userAnime.last_watched_episode_id) {
        // Получаем следующий эпизод после последнего просмотренного
        nextEpisode = await this.userEpisodeService.getNextEpisodeOfAnime(
          userAnime.anime_id,
          userAnime.last_watched_episode_id,
        );
      }

      // Формируем ответ с информацией о релизе
      const responseItem: NextEpisodeResponseDto = {
        anime_id: userAnime.anime_id,
        anime: userAnime.anime,
        anime_release: nextEpisode?.animeRelease || null,
        next_episode: nextEpisode,
      };

      result.push(responseItem);
    }

    return result;
  }

  /**
   * Получает следующие эпизоды для конкретного аниме
   */
  async getNextEpisodesForAnime(
    userId: string,
    animeId: string,
  ): Promise<NextEpisodeResponseDto | null> {
    // Получаем аниме пользователя
    const userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
      relations: ['anime'],
    });

    if (!userAnime) {
      return null;
    }

    let nextEpisode: Episode | null = null;

    if (userAnime.last_watched_episode_id) {
      // Получаем следующий эпизод после последнего просмотренного
      nextEpisode = await this.userEpisodeService.getNextEpisodeOfAnime(
        userAnime.anime_id,
        userAnime.last_watched_episode_id,
      );
    }

    return {
      anime_id: userAnime.anime_id,
      anime: userAnime.anime,
      anime_release: nextEpisode
        ? {
            id: nextEpisode.animeRelease.id,
            title_ru: nextEpisode.animeRelease.title_ru,
            title_en: nextEpisode.animeRelease.title_en,
            sort_order: nextEpisode.animeRelease.sort_order,
            year: nextEpisode.animeRelease.year,
            poster_url: nextEpisode.animeRelease.poster_url,
            alias: nextEpisode.animeRelease.alias,
            type: nextEpisode.animeRelease.type,
            is_ongoing: nextEpisode.animeRelease.is_ongoing,
            episodes_total: nextEpisode.animeRelease.episodes_total,
          }
        : null,
      next_episode: nextEpisode
        ? {
            id: nextEpisode.id,
            number: nextEpisode.number,
            video_url: nextEpisode.video_url,
            subtitles_url: nextEpisode.subtitles_url,
            video_url_480: nextEpisode.video_url_480,
            video_url_720: nextEpisode.video_url_720,
            video_url_1080: nextEpisode.video_url_1080,
            duration: nextEpisode.duration,
            preview_image: nextEpisode.preview_image,
          }
        : null,
    };
  }
}
