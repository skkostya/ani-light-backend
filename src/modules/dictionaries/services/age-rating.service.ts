import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgeRatingDto, UpdateAgeRatingDto } from '../dto/age-rating.dto';
import { AgeRating } from '../entities/age-rating.entity';

@Injectable()
export class AgeRatingService {
  constructor(
    @InjectRepository(AgeRating)
    private ageRatingRepository: Repository<AgeRating>,
  ) {}

  async create(createAgeRatingDto: CreateAgeRatingDto): Promise<AgeRating> {
    const ageRating = this.ageRatingRepository.create(createAgeRatingDto);
    return this.ageRatingRepository.save(ageRating);
  }

  async findAll(): Promise<AgeRating[]> {
    return this.ageRatingRepository.find({
      order: { value: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AgeRating> {
    const ageRating = await this.ageRatingRepository.findOne({ where: { id } });
    if (!ageRating) {
      throw new NotFoundException(`Age rating with ID ${id} not found`);
    }
    return ageRating;
  }

  async findByValue(value: string): Promise<AgeRating> {
    const ageRating = await this.ageRatingRepository.findOne({
      where: { value },
    });
    if (!ageRating) {
      throw new NotFoundException(`Age rating with value ${value} not found`);
    }
    return ageRating;
  }

  async update(
    id: string,
    updateAgeRatingDto: UpdateAgeRatingDto,
  ): Promise<AgeRating> {
    const ageRating = await this.findOne(id);
    Object.assign(ageRating, updateAgeRatingDto);
    return this.ageRatingRepository.save(ageRating);
  }

  async remove(id: string): Promise<void> {
    const ageRating = await this.findOne(id);
    await this.ageRatingRepository.remove(ageRating);
  }
}
