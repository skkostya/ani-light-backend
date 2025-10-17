import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateUserEpisodeDto,
  MarkEpisodeWatchedDto,
  UpdateUserEpisodeDto,
} from './dto/user-episode.dto';
import {
  EpisodeWatchStatus,
  UserEpisode,
} from './entities/user-episode.entity';

@Injectable()
export class UserEpisodeService {
  constructor(
    @InjectRepository(UserEpisode)
    private userEpisodeRepository: Repository<UserEpisode>,
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

    return this.userEpisodeRepository.save(userEpisode);
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
    return this.userEpisodeRepository.save(userEpisode);
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
}
