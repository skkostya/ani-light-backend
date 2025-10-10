import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AniLibriaAnime,
  AniLibriaGenre,
} from '../../anime/types/anilibria-api.types';
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

  async syncGenresFromApi(titles: AniLibriaAnime[]): Promise<void> {
    console.log('Syncing genres from API...');

    // Собираем все уникальные жанры из всех аниме
    const allGenres = new Map<
      number,
      {
        external_id: number;
        name: string;
        image: { optimized_preview: string; preview: string };
      }
    >();
    titles.forEach((title) => {
      if (title.genres && Array.isArray(title.genres)) {
        title.genres.forEach((genre) => {
          if (genre.id && genre.name) {
            allGenres.set(genre.id, {
              external_id: genre.id,
              name: genre.name,
              image: {
                optimized_preview: genre.image?.optimized?.preview || '',
                preview: genre.image?.preview || '',
              },
            });
          }
        });
      }
    });

    console.log(`Found ${allGenres.size} unique genres`);

    // Синхронизируем каждый жанр
    for (const [externalId, genreData] of allGenres) {
      try {
        const existingGenre = await this.findByExternalId(externalId);
        // Обновляем существующий жанр
        await this.update(existingGenre.id, genreData);
        console.log(`Updated genre: ${genreData.name}`);
      } catch {
        // Жанр не найден, создаем новый
        try {
          await this.create(genreData);
          console.log(`Created new genre: ${genreData.name}`);
        } catch (createError) {
          console.error(
            `Failed to create genre ${genreData.name}:`,
            createError,
          );
        }
      }
    }
  }

  async processGenresFromApi(genres: AniLibriaGenre[]): Promise<string[]> {
    const genreIds: string[] = [];

    for (const genre of genres) {
      if (genre.id) {
        try {
          const genreEntity = await this.findByExternalId(genre.id);
          genreIds.push(genreEntity.id);
        } catch (error) {
          console.error(`Genre with external ID ${genre.id} not found:`, error);
        }
      }
    }

    return genreIds;
  }
}
