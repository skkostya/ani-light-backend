import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAnimeRatingDto,
  UpdateAnimeRatingDto,
} from './dto/anime-release-rating.dto';
import { AnimeRating } from './entities/anime-release-rating.entity';

@Injectable()
export class AnimeReleaseRatingService {
  constructor(
    @InjectRepository(AnimeRating)
    private ratingRepository: Repository<AnimeRating>,
  ) {}

  async create(
    userId: string,
    createDto: CreateAnimeRatingDto,
  ): Promise<AnimeRating> {
    // Проверяем, не существует ли уже рейтинг
    const existing = await this.ratingRepository.findOne({
      where: { user_id: userId, anime_id: createDto.anime_id },
    });

    if (existing) {
      throw new ConflictException('Рейтинг для этого аниме уже существует');
    }

    const rating = this.ratingRepository.create({
      user_id: userId,
      ...createDto,
    });

    return this.ratingRepository.save(rating);
  }

  async update(
    userId: string,
    animeId: string,
    updateDto: UpdateAnimeRatingDto,
  ): Promise<AnimeRating> {
    const rating = await this.ratingRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не найден');
    }

    Object.assign(rating, updateDto);
    return this.ratingRepository.save(rating);
  }

  async findOne(userId: string, animeId: string): Promise<AnimeRating> {
    const rating = await this.ratingRepository.findOne({
      where: { user_id: userId, anime_id: animeId },
      relations: ['anime', 'user'],
    });

    if (!rating) {
      throw new NotFoundException('Рейтинг не найден');
    }

    return rating;
  }

  async findByUser(userId: string): Promise<AnimeRating[]> {
    return this.ratingRepository.find({
      where: { user_id: userId },
      relations: ['anime'],
      order: { created_at: 'DESC' },
    });
  }

  async findByAnime(animeId: string): Promise<AnimeRating[]> {
    return this.ratingRepository.find({
      where: { anime_id: animeId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAverageRating(
    animeId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.anime_id::text = :animeId', { animeId })
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      count: parseInt(result.count) || 0,
    };
  }

  async remove(userId: string, animeId: string): Promise<void> {
    const result = await this.ratingRepository.delete({
      user_id: userId,
      anime_id: animeId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Рейтинг не найден');
    }
  }
}
