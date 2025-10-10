import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateEpisodeRatingDto,
  UpdateEpisodeRatingDto,
} from './dto/episode-rating.dto';
import { EpisodeRating } from './entities/episode-rating.entity';

@Injectable()
export class EpisodeRatingService {
  constructor(
    @InjectRepository(EpisodeRating)
    private ratingRepository: Repository<EpisodeRating>,
  ) {}

  async create(
    userId: string,
    createDto: CreateEpisodeRatingDto,
  ): Promise<EpisodeRating> {
    // Проверяем, не существует ли уже рейтинг
    const existing = await this.ratingRepository.findOne({
      where: { user_id: userId, episode_id: createDto.episode_id },
    });

    if (existing) {
      throw new ConflictException('Рейтинг для этого эпизода уже существует');
    }

    const rating = this.ratingRepository.create({
      user_id: userId,
      ...createDto,
    });

    return this.ratingRepository.save(rating);
  }

  async update(
    userId: string,
    episodeId: string,
    updateDto: UpdateEpisodeRatingDto,
  ): Promise<EpisodeRating> {
    const rating = await this.ratingRepository.findOne({
      where: { user_id: userId, episode_id: episodeId },
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не найден');
    }

    Object.assign(rating, updateDto);
    return this.ratingRepository.save(rating);
  }

  async findOne(userId: string, episodeId: string): Promise<EpisodeRating> {
    const rating = await this.ratingRepository.findOne({
      where: { user_id: userId, episode_id: episodeId },
      relations: ['episode', 'user'],
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не найден');
    }

    return rating;
  }

  async findByUser(userId: string): Promise<EpisodeRating[]> {
    return this.ratingRepository.find({
      where: { user_id: userId },
      relations: ['episode', 'episode.anime'],
      order: { created_at: 'DESC' },
    });
  }

  async findByEpisode(episodeId: string): Promise<EpisodeRating[]> {
    return this.ratingRepository.find({
      where: { episode_id: episodeId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAverageRating(
    episodeId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.episode_id = :episodeId', { episodeId })
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  async remove(userId: string, episodeId: string): Promise<void> {
    const result = await this.ratingRepository.delete({
      user_id: userId,
      episode_id: episodeId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Рейтинг не найден');
    }
  }
}
