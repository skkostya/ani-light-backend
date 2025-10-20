import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { AnimeRelease } from '../anime-release/entities/anime-release.entity';
import { Episode } from '../episode/entities/episode.entity';
import {
  CreateUserEpisodeDto,
  MarkEpisodeWatchedDto,
  UpdateUserEpisodeDto,
} from './dto/user-episode.dto';
import { UserAnime } from './entities/user-anime.entity';
import {
  EpisodeWatchStatus,
  UserEpisode,
} from './entities/user-episode.entity';

@Injectable()
export class UserEpisodeService {
  constructor(
    @InjectRepository(UserEpisode)
    private userEpisodeRepository: Repository<UserEpisode>,
    @InjectRepository(UserAnime)
    private userAnimeRepository: Repository<UserAnime>,
    @InjectRepository(AnimeRelease)
    private animeReleaseRepository: Repository<AnimeRelease>,
    @InjectRepository(Episode)
    private episodeRepository: Repository<Episode>,
  ) {}

  async create(
    userId: string,
    createDto: CreateUserEpisodeDto,
  ): Promise<UserEpisode> {
    // Проверяем, не существует ли уже связь
    const existing = await this.userEpisodeRepository.findOne({
      where: { user_id: userId, episode_id: createDto.episode_id },
    });

    if (existing) {
      throw new ConflictException(
        'Связь пользователя с эпизодом уже существует',
      );
    }

    const userEpisode = this.userEpisodeRepository.create({
      user_id: userId,
      ...createDto,
    });

    return this.userEpisodeRepository.save(userEpisode);
  }

  async update(
    userId: string,
    episodeId: string,
    updateDto: UpdateUserEpisodeDto,
  ): Promise<UserEpisode> {
    const userEpisode = await this.userEpisodeRepository.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });

    if (!userEpisode) {
      throw new NotFoundException('Связь пользователя с эпизодом не найдена');
    }

    Object.assign(userEpisode, updateDto);
    return this.userEpisodeRepository.save(userEpisode);
  }

  async findOne(userId: string, episodeId: string): Promise<UserEpisode> {
    const userEpisode = await this.userEpisodeRepository.findOne({
      where: { user_id: userId, episode_id: episodeId },
      relations: ['episode', 'user'],
    });

    if (!userEpisode) {
      throw new NotFoundException('Связь пользователя с эпизодом не найдена');
    }

    return userEpisode;
  }

  async findByUser(userId: string): Promise<UserEpisode[]> {
    return this.userEpisodeRepository.find({
      where: { user_id: userId },
      relations: ['episode', 'episode.animeRelease'],
      order: { created_at: 'DESC' },
    });
  }

  async findByEpisode(episodeId: string): Promise<UserEpisode[]> {
    return this.userEpisodeRepository.find({
      where: { episode_id: episodeId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getWatchedEpisodes(userId: string): Promise<UserEpisode[]> {
    return this.userEpisodeRepository.find({
      where: { user_id: userId, status: EpisodeWatchStatus.WATCHED },
      relations: ['episode', 'episode.animeRelease'],
      order: { watched_until_end_at: 'DESC' },
    });
  }

  async getWatchingEpisodes(userId: string): Promise<UserEpisode[]> {
    return this.userEpisodeRepository.find({
      where: { user_id: userId, status: EpisodeWatchStatus.WATCHING },
      relations: ['episode', 'episode.animeRelease'],
      order: { last_watched_at: 'DESC' },
    });
  }

  async getLastWatchedEpisodes(userId: string): Promise<any[]> {
    const result = await this.userEpisodeRepository.find({
      where: {
        user_id: userId,
        status: In([EpisodeWatchStatus.WATCHED, EpisodeWatchStatus.WATCHING]),
      },
      relations: [
        'episode',
        'episode.animeRelease',
        'episode.animeRelease.anime',
      ],
      order: { last_watched_at: 'DESC' },
      take: 15,
      skip: 0,
    });

    // Возвращаем только ID связанных сущностей
    return result.map((userEpisode) => ({
      ...userEpisode,
      episode: {
        ...userEpisode.episode,
        anime_release_id: userEpisode.episode.anime_release_id,
        anime_id: userEpisode.episode.animeRelease?.anime?.id || null,
        animeRelease: {
          ...userEpisode.episode.animeRelease,
          anime: undefined,
        },
      },
    }));
  }

  async getWatchHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<UserEpisode>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userEpisodeRepository.findAndCount({
      where: {
        user_id: userId,
        status: In([EpisodeWatchStatus.WATCHED, EpisodeWatchStatus.WATCHING]),
      },
      relations: ['episode', 'episode.animeRelease'],
      order: { last_watched_at: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async markAsWatched(
    userId: string,
    episodeId: string,
    markDto: MarkEpisodeWatchedDto,
  ): Promise<UserEpisode> {
    let userEpisode = await this.userEpisodeRepository.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });

    if (!userEpisode) {
      // Создаем новую связь
      userEpisode = this.userEpisodeRepository.create({
        user_id: userId,
        episode_id: episodeId,
        status: EpisodeWatchStatus.WATCHED,
      });
    } else {
      userEpisode.status = EpisodeWatchStatus.WATCHED;
    }

    const now = new Date();
    userEpisode.last_watched_at = now;

    if (markDto.watched_until_end) {
      userEpisode.watched_until_end_at = now;
    }

    const savedUserEpisode = await this.userEpisodeRepository.save(userEpisode);

    // ОБНОВЛЯЕМ СОСТОЯНИЕ В UserAnime
    await this.updateUserAnimeWatchingState(userId, episodeId, true);

    return savedUserEpisode;
  }

  async markAsWatching(
    userId: string,
    episodeId: string,
  ): Promise<UserEpisode> {
    let userEpisode = await this.userEpisodeRepository.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });

    if (!userEpisode) {
      // Создаем новую связь
      userEpisode = this.userEpisodeRepository.create({
        user_id: userId,
        episode_id: episodeId,
        status: EpisodeWatchStatus.WATCHING,
      });
    } else {
      userEpisode.status = EpisodeWatchStatus.WATCHING;
    }

    userEpisode.last_watched_at = new Date();
    const savedUserEpisode = await this.userEpisodeRepository.save(userEpisode);

    // ОБНОВЛЯЕМ СОСТОЯНИЕ В UserAnime
    await this.updateUserAnimeWatchingState(userId, episodeId, false);

    return savedUserEpisode;
  }

  async remove(userId: string, episodeId: string): Promise<void> {
    const result = await this.userEpisodeRepository.delete({
      user_id: userId,
      episode_id: episodeId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Связь пользователя с эпизодом не найдена');
    }
  }

  /**
   * Получает ID последнего эпизода последнего завершенного сезона аниме
   */
  private async getLastEpisodeIdOfAnime(
    animeId: string,
  ): Promise<string | null> {
    // Находим последний завершенный сезон (с максимальным sort_order и is_ongoing: false)
    const lastSeason = await this.animeReleaseRepository
      .createQueryBuilder('animeRelease')
      .where('animeRelease.anime_id = :animeId', { animeId })
      .andWhere('animeRelease.is_ongoing = :isOngoing', { isOngoing: false })
      .select('animeRelease.sort_order', 'sort_order')
      .orderBy('animeRelease.sort_order', 'DESC')
      .limit(1)
      .getRawOne();

    if (!lastSeason) return null;

    // Находим последний эпизод этого сезона из всех доступных эпизодов
    const lastEpisode = await this.episodeRepository
      .createQueryBuilder('episode')
      .leftJoin('episode.animeRelease', 'animeRelease')
      .where('animeRelease.anime_id = :animeId', { animeId })
      .andWhere('animeRelease.sort_order = :sortOrder', {
        sortOrder: lastSeason.sort_order,
      })
      .andWhere('animeRelease.is_ongoing = :isOngoing', { isOngoing: false })
      .select('episode.id', 'id')
      .orderBy('episode.number', 'DESC')
      .limit(1)
      .getRawOne();

    return lastEpisode?.id || null;
  }

  /**
   * Получает следующий эпизод аниме после указанного эпизода
   */
  async getNextEpisodeOfAnime(
    animeId: string,
    currentEpisodeId: string,
  ): Promise<Episode | null> {
    // Получаем информацию о текущем эпизоде
    const currentEpisode = await this.userEpisodeRepository
      .createQueryBuilder('userEpisode')
      .leftJoinAndSelect('userEpisode.episode', 'episode')
      .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
      .where('userEpisode.episode_id = :episodeId', {
        episodeId: currentEpisodeId,
      })
      .getOne();

    if (!currentEpisode?.episode?.animeRelease) return null;

    const currentSeason = currentEpisode.episode.animeRelease.sort_order;
    const currentEpisodeNumber = currentEpisode.episode.number;

    // Ищем следующий эпизод в том же сезоне из всех доступных эпизодов
    const nextEpisodeInSeason = await this.episodeRepository
      .createQueryBuilder('episode')
      .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
      .where('animeRelease.anime_id = :animeId', { animeId })
      .andWhere('animeRelease.sort_order = :sortOrder', {
        sortOrder: currentSeason,
      })
      .andWhere('episode.number > :episodeNumber', {
        episodeNumber: currentEpisodeNumber,
      })
      .orderBy('episode.number', 'ASC')
      .limit(1)
      .getOne();

    if (nextEpisodeInSeason) {
      return nextEpisodeInSeason;
    }

    // Если в текущем сезоне нет следующего эпизода, ищем первый эпизод следующего сезона
    // (включая продолжающиеся сезоны)
    const nextSeason = await this.episodeRepository
      .createQueryBuilder('episode')
      .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
      .where('animeRelease.anime_id = :animeId', { animeId })
      .andWhere('animeRelease.sort_order > :sortOrder', {
        sortOrder: currentSeason,
      })
      .orderBy('animeRelease.sort_order', 'ASC')
      .orderBy('episode.number', 'ASC')
      .limit(1)
      .getOne();

    if (nextSeason) {
      return nextSeason;
    }

    return null;
  }

  /**
   * Обновляет состояние просмотра аниме на основе эпизодов пользователя
   */
  private async updateUserAnimeWatchingState(
    userId: string,
    episodeId: string,
    finishEpisode: boolean,
  ): Promise<void> {
    // Получаем информацию об эпизоде с аниме
    const episode = await this.userEpisodeRepository
      .createQueryBuilder('userEpisode')
      .leftJoinAndSelect('userEpisode.episode', 'episode')
      .leftJoinAndSelect('episode.animeRelease', 'animeRelease')
      .leftJoinAndSelect('animeRelease.anime', 'anime')
      .where('userEpisode.user_id = :userId', { userId })
      .andWhere('userEpisode.episode_id = :episodeId', { episodeId })
      .getOne();

    if (!episode?.episode?.animeRelease?.anime) return;

    const animeId = episode.episode.animeRelease.anime.id;

    // Находим или создаем UserAnime
    let userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
    });

    if (!userAnime) {
      userAnime = this.userAnimeRepository.create({
        user_id: userId,
        anime_id: animeId,
        is_watching: false,
      });
    }

    userAnime.is_watching = true;
    userAnime.last_watched_episode_id = episodeId;
    userAnime.last_watched_at = episode.last_watched_at;

    // Проверяем, завершен ли просмотр аниме
    const lastEpisodeId = await this.getLastEpisodeIdOfAnime(animeId);

    if (lastEpisodeId && episodeId === lastEpisodeId && finishEpisode) {
      // Проверяем, есть ли среди релизов аниме продолжающиеся (is_ongoing: true)
      const hasOngoingReleases = await this.animeReleaseRepository
        .createQueryBuilder('animeRelease')
        .where('animeRelease.anime_id = :animeId', { animeId })
        .andWhere('animeRelease.is_ongoing = :isOngoing', { isOngoing: true })
        .getExists();

      // Если нет продолжающихся релизов, завершаем просмотр
      if (!hasOngoingReleases) {
        userAnime.is_watching = false;
        userAnime.last_watched_episode_id = undefined;
        userAnime.last_watched_at = undefined;
      }
    }

    await this.userAnimeRepository.save(userAnime);
  }

  /**
   * Прекращает просмотр аниме и удаляет все связанные эпизоды
   */
  async stopWatchingAnime(userId: string, animeId: string): Promise<void> {
    // Находим UserAnime
    const userAnime = await this.userAnimeRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
    });

    if (!userAnime) {
      throw new NotFoundException('Аниме не найдено в списке пользователя');
    }

    // Сбрасываем флаг просмотра
    userAnime.is_watching = false;
    userAnime.last_watched_episode_id = undefined;
    userAnime.last_watched_at = undefined;

    await this.userAnimeRepository.save(userAnime);

    // Получаем все релизы этого аниме
    const animeReleaseIds = await this.userEpisodeRepository
      .createQueryBuilder('userEpisode')
      .leftJoin('userEpisode.episode', 'episode')
      .leftJoin('episode.animeRelease', 'animeRelease')
      .where('animeRelease.anime_id = :animeId', { animeId })
      .select('DISTINCT episode.anime_release_id', 'anime_release_id')
      .getRawMany();

    const releaseIds = animeReleaseIds.map(
      (item) => item.episode_anime_release_id,
    );

    if (releaseIds.length > 0) {
      // Удаляем все связи с эпизодами этого аниме
      await this.userEpisodeRepository
        .createQueryBuilder()
        .delete()
        .where('user_id = :userId', { userId })
        .andWhere(
          'episode_id IN (SELECT id FROM episode WHERE anime_release_id IN (:...releaseIds))',
          { releaseIds },
        )
        .execute();
    }
  }
}
