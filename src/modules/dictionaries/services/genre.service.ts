import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGenreDto, UpdateGenreDto } from '../dto/genre.dto';
import { Genre } from '../entities/genre.entity';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepository.create(createGenreDto);
    return this.genreRepository.save(genre);
  }

  async findAll(): Promise<Genre[]> {
    return this.genreRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async findByExternalId(externalId: number): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { external_id: externalId },
    });
    if (!genre) {
      throw new NotFoundException(
        `Genre with external ID ${externalId} not found`,
      );
    }
    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);
    Object.assign(genre, updateGenreDto);
    return this.genreRepository.save(genre);
  }

  async remove(id: string): Promise<void> {
    const genre = await this.findOne(id);
    await this.genreRepository.remove(genre);
  }

  async findByIds(ids: string[]): Promise<Genre[]> {
    return this.genreRepository.findByIds(ids);
  }

  async findByName(name: string): Promise<Genre | null> {
    return this.genreRepository.findOne({
      where: { name: name },
    });
  }
}
