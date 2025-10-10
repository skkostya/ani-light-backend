import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnimeGenre } from './entities/anime-genre.entity';

@Injectable()
export class AnimeGenreService {
  constructor(
    @InjectRepository(AnimeGenre)
    private animeGenreRepository: Repository<AnimeGenre>,
  ) {}

  async updateAnimeGenres(animeId: string, genreIds: string[]): Promise<void> {
    // Удаляем существующие связи
    await this.animeGenreRepository.delete({ anime_id: animeId });

    // Создаем новые связи
    for (const genreId of genreIds) {
      const animeGenre = this.animeGenreRepository.create({
        anime_id: animeId,
        genre_id: genreId,
      });
      await this.animeGenreRepository.save(animeGenre);
    }

    console.log(
      `Updated ${genreIds.length} genre associations for anime ${animeId}`,
    );
  }

  async getAnimeGenres(animeId: string): Promise<AnimeGenre[]> {
    return await this.animeGenreRepository.find({
      where: { anime_id: animeId },
      relations: ['genre'],
    });
  }
}
