import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { HttpRetryService } from '../../common/services/http-retry.service';
import { AniLibriaFranchiseResponse } from '../anime-release/types/anilibria-api.types';
import { UserAnime } from '../user/entities/user-anime.entity';
import { ExternalApiAnimeDto, GetAnimeListDto } from './dto/anime.dto';
import { Anime } from './entities/anime.entity';

@Injectable()
export class AnimeService {
  private readonly logger = new Logger(AnimeService.name);
  private readonly apiUrl: string;

  constructor(
    @InjectRepository(Anime)
    private animeRepository: Repository<Anime>,
    @InjectRepository(UserAnime)
    private userAnimeRepository: Repository<UserAnime>,
    private readonly configService: ConfigService,
    private readonly httpRetryService: HttpRetryService,
  ) {
    this.apiUrl = this.configService.get('ANILIBRIA_API_URL') || '';
  }

  async syncAllAnimeFromApi() {
    try {
      this.logger.log('Starting anime synchronization from external API...');

      // Получаем данные с внешнего API
      const response = await this.httpRetryService.get<ExternalApiAnimeDto[]>(
        `${this.apiUrl}/anime/franchises`,
      );

      const externalAnimeList = response.data;
      this.logger.log(
        `Received ${externalAnimeList.length} anime from external API`,
      );

      let syncedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;

      // Обрабатываем каждый аниме из внешнего API
      for (const externalAnime of externalAnimeList) {
        try {
          // Проверяем, существует ли аниме в нашей базе по external_id
          const existingAnime = await this.animeRepository.findOne({
            where: { external_id: externalAnime.id },
          });

          if (existingAnime) {
            // Обновляем существующее аниме
            await this.updateAnimeFromExternalData(
              existingAnime,
              externalAnime,
            );
            updatedCount++;
            this.logger.debug(`Updated anime: ${externalAnime.name}`);
          } else {
            // Создаем новое аниме
            await this.createAnimeFromExternalData(externalAnime);
            createdCount++;
            this.logger.debug(`Created anime: ${externalAnime.name}`);
          }

          syncedCount++;
        } catch (animeError) {
          this.logger.error(
            `Error processing anime ${externalAnime.name} (${externalAnime.id}):`,
            animeError,
          );
        }
      }

      this.logger.log(
        `Anime synchronization completed. Total: ${syncedCount}, Created: ${createdCount}, Updated: ${updatedCount}`,
      );

      return {
        total: syncedCount,
        created: createdCount,
        updated: updatedCount,
        errors: externalAnimeList.length - syncedCount,
      };
    } catch (error) {
      this.logger.error('Error syncing all anime from API:', error);
      throw error;
    }
  }

  async findAll(
    query: GetAnimeListDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<Anime>> {
    const {
      search,
      min_rating,
      max_rating,
      year_from,
      year_to,
      genre,
      is_ongoing,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.animeReleases', 'animeReleases')
      .leftJoinAndSelect('animeReleases.animeGenres', 'animeGenres')
      .leftJoinAndSelect('animeGenres.genre', 'genre');

    // Добавляем связь userAnime для текущего пользователя, если он авторизован
    if (userId) {
      qb.leftJoinAndSelect(
        'anime.userAnime',
        'userAnime',
        'userAnime.user_id = :userId',
        { userId },
      );
    }

    // Поиск по названию
    if (search) {
      qb.where(
        '(anime.name ILIKE :search OR anime.name_english ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Фильтр по рейтингу
    if (min_rating !== undefined) {
      qb.andWhere('anime.rating >= :min_rating', { min_rating });
    }
    if (max_rating !== undefined) {
      qb.andWhere('anime.rating <= :max_rating', { max_rating });
    }

    // Фильтр по годам
    if (year_from !== undefined) {
      qb.andWhere('anime.first_year >= :year_from', { year_from });
    }
    if (year_to !== undefined) {
      qb.andWhere('anime.last_year <= :year_to', { year_to });
    }

    // Фильтр по жанру
    if (genre) {
      qb.andWhere('genre.name ILIKE :genre', { genre: `%${genre}%` });
    }

    // Фильтр по статусу "в процессе"
    if (is_ongoing !== undefined) {
      qb.andWhere('animeReleases.is_ongoing = :is_ongoing', { is_ongoing });
    }

    // Сортировка по рейтингу (по убыванию)
    qb.orderBy('anime.rating', 'DESC');

    // Пагинация
    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    const [animeList, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(animeList, total, page, limit);
  }

  async findOne(id: string, userId?: string): Promise<Anime> {
    const qb = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.animeReleases', 'animeReleases')
      .where('anime.id::text = :id', { id });

    const anime = await qb.getOne();

    if (!anime) {
      throw new NotFoundException(`Anime with ID ${id} not found`);
    }

    // Если пользователь авторизован, загружаем связь userAnime отдельно
    if (userId) {
      const userAnime = await this.userAnimeRepository.find({
        where: { anime_id: id, user_id: userId },
      });
      anime.userAnime = userAnime;
    }

    return anime;
  }

  async remove(id: string): Promise<void> {
    const anime = await this.findOne(id);
    await this.animeRepository.remove(anime);
  }

  async getAnimeStats(id: string): Promise<{
    total_releases: number;
    total_episodes: number;
    total_duration_in_seconds: number;
    average_rating: number;
  }> {
    const anime = await this.findOne(id);

    // Подсчитываем статистику из связанных anime-releases
    const stats = anime.animeReleases.reduce(
      (acc, release) => {
        acc.total_releases += 1;
        acc.total_episodes += release.episodes_total || 0;
        acc.total_duration_in_seconds +=
          (release.episodes_total || 0) *
          (release.average_duration_of_episode || 0);
        return acc;
      },
      {
        total_releases: 0,
        total_episodes: 0,
        total_duration_in_seconds: 0,
        average_rating: 0,
      },
    );

    // Обновляем статистику в anime
    anime.total_releases = stats.total_releases;
    anime.total_episodes = stats.total_episodes;
    anime.total_duration_in_seconds = stats.total_duration_in_seconds;

    // Форматируем продолжительность
    anime.total_duration = this.formatDuration(stats.total_duration_in_seconds);

    await this.animeRepository.save(anime);

    return {
      total_releases: stats.total_releases,
      total_episodes: stats.total_episodes,
      total_duration_in_seconds: stats.total_duration_in_seconds,
      average_rating: anime.rating || 0,
    };
  }

  private formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? 'день' : 'дня'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'час' : 'часа'}`);
    if (minutes > 0)
      parts.push(`${minutes} ${minutes === 1 ? 'минута' : 'минуты'}`);

    return parts.join(' ') || '0 минут';
  }

  async getAnimeByGenre(
    genreName: string,
    query: GetAnimeListDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<Anime>> {
    const { page = 1, limit = 20 } = query;

    const qb = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.animeReleases', 'animeReleases')
      .leftJoinAndSelect('animeReleases.animeGenres', 'animeGenres')
      .leftJoinAndSelect('animeGenres.genre', 'genre')
      .where('genre.name ILIKE :genreName', { genreName: `%${genreName}%` })
      .orderBy('anime.rating', 'DESC');

    // Добавляем связь userAnime для текущего пользователя, если он авторизован
    if (userId) {
      qb.leftJoinAndSelect(
        'anime.userAnime',
        'userAnime',
        'userAnime.user_id = :userId',
        { userId },
      );
    }

    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    const [animeList, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(animeList, total, page, limit);
  }

  async getOngoingAnime(
    query: GetAnimeListDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<Anime>> {
    const { page = 1, limit = 20 } = query;

    const qb = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.animeReleases', 'animeReleases')
      .leftJoinAndSelect('animeReleases.animeGenres', 'animeGenres')
      .leftJoinAndSelect('animeGenres.genre', 'genre')
      .where('animeReleases.is_ongoing = :is_ongoing', { is_ongoing: true })
      .orderBy('anime.rating', 'DESC');

    // Добавляем связь userAnime для текущего пользователя, если он авторизован
    if (userId) {
      qb.leftJoinAndSelect(
        'anime.userAnime',
        'userAnime',
        'userAnime.user_id = :userId',
        { userId },
      );
    }

    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);

    const [animeList, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(animeList, total, page, limit);
  }

  async getGenreStats(): Promise<{ genre: string; count: number }[]> {
    const result = await this.animeRepository
      .createQueryBuilder('anime')
      .leftJoin('anime.animeReleases', 'animeReleases')
      .leftJoin('animeReleases.animeGenres', 'animeGenres')
      .leftJoin('animeGenres.genre', 'genre')
      .select('genre.name', 'genre')
      .addSelect('COUNT(DISTINCT anime.id)', 'count')
      .where('genre.name IS NOT NULL')
      .groupBy('genre.name')
      .orderBy('count', 'DESC')
      .getRawMany();

    return result.map((item) => ({
      genre: item.genre as string,
      count: parseInt(item.count as string, 10),
    }));
  }

  /**
   * Создает новое аниме из данных внешнего API
   */
  private async createAnimeFromExternalData(
    externalAnime: ExternalApiAnimeDto,
  ): Promise<Anime> {
    const animeData = this.mapExternalDataToAnime(externalAnime);
    const anime = this.animeRepository.create(animeData);
    return this.animeRepository.save(anime);
  }

  /**
   * Обновляет существующее аниме данными из внешнего API
   */
  private async updateAnimeFromExternalData(
    existingAnime: Anime,
    externalAnime: ExternalApiAnimeDto,
  ): Promise<Anime> {
    const animeData = this.mapExternalDataToAnime(externalAnime);
    Object.assign(existingAnime, animeData);
    return this.animeRepository.save(existingAnime);
  }

  /**
   * Маппит данные из внешнего API в формат сущности Anime
   */
  private mapExternalDataToAnime(
    externalAnime: ExternalApiAnimeDto,
  ): Partial<Anime> {
    return {
      external_id: externalAnime.id,
      name: externalAnime.name,
      name_english: externalAnime.name_english,
      image:
        externalAnime.image?.optimized?.preview ||
        externalAnime.image?.preview ||
        externalAnime.image?.optimized?.thumbnail ||
        externalAnime.image?.thumbnail ||
        undefined,
      rating: externalAnime.rating,
      last_year: externalAnime.last_year,
      first_year: externalAnime.first_year,
      total_releases: externalAnime.total_releases,
      total_episodes: externalAnime.total_episodes,
      total_duration: externalAnime.total_duration,
      total_duration_in_seconds: externalAnime.total_duration_in_seconds,
    };
  }

  /**
   * Находит anime по external_id
   */
  async findOneByExternalId(externalId: string): Promise<Anime | null> {
    return this.animeRepository.findOne({
      where: { external_id: externalId },
    });
  }

  /**
   * Создает новое anime на основе данных франшизы
   */
  async createFromFranchiseData(
    franchiseData: AniLibriaFranchiseResponse,
    alias?: string,
  ): Promise<Anime> {
    const animeData = this.mapFranchiseDataToAnime(franchiseData);
    if (alias) animeData.alias = alias;
    const anime = this.animeRepository.create(animeData);
    return this.animeRepository.save(anime);
  }

  /**
   * Обновляет существующее anime данными франшизы
   */
  async updateFromFranchiseData(
    existingAnime: Anime,
    franchiseData: AniLibriaFranchiseResponse,
    alias?: string,
  ): Promise<Anime> {
    const animeData = this.mapFranchiseDataToAnime(franchiseData);
    if (alias) animeData.alias = alias;
    Object.assign(existingAnime, animeData);
    return this.animeRepository.save(existingAnime);
  }

  /**
   * Маппит данные франшизы в формат сущности Anime
   */
  private mapFranchiseDataToAnime(
    franchiseData: AniLibriaFranchiseResponse,
  ): Partial<Anime> {
    return {
      external_id: franchiseData.id,
      name: franchiseData.name,
      name_english: franchiseData.name_english,
      image:
        franchiseData.image?.optimized?.preview ||
        franchiseData.image?.preview ||
        franchiseData.image?.optimized?.thumbnail ||
        franchiseData.image?.thumbnail ||
        undefined,
      rating: franchiseData.rating,
      last_year: franchiseData.last_year,
      first_year: franchiseData.first_year,
      total_releases: franchiseData.total_releases,
      total_episodes: franchiseData.total_episodes,
      total_duration: franchiseData.total_duration,
      total_duration_in_seconds: franchiseData.total_duration_in_seconds,
    };
  }

  /**
   * Получает все релизы аниме с полной информацией
   */
  async getAnimeReleases(idOrAlias: string, userId?: string): Promise<Anime> {
    const qb = this.animeRepository
      .createQueryBuilder('anime')
      .leftJoinAndSelect('anime.animeReleases', 'animeReleases')
      .leftJoinAndSelect('animeReleases.ageRating', 'ageRating')
      .leftJoinAndSelect('animeReleases.animeGenres', 'animeGenres')
      .leftJoinAndSelect('animeGenres.genre', 'genre')
      .where('anime.id::text = :idOrAlias OR anime.alias = :idOrAlias', {
        idOrAlias,
      })
      .orderBy('animeReleases.sort_order', 'ASC');

    const anime = await qb.getOne();

    if (!anime) {
      throw new NotFoundException(`Anime with ID ${idOrAlias} not found`);
    }

    // Если пользователь авторизован, загружаем связь userAnime отдельно
    if (userId) {
      const userAnime = await this.userAnimeRepository.find({
        where: { anime_id: anime.id, user_id: userId },
      });
      anime.userAnime = userAnime;
    }

    return anime;
  }

  /**
   * Ищет anime по названию (русскому или английскому)
   */
  async findByName(nameRu?: string, nameEn?: string): Promise<Anime | null> {
    if (!nameRu && !nameEn) return null;

    const queryBuilder = this.animeRepository.createQueryBuilder('anime');

    if (nameRu && nameEn) {
      queryBuilder.where(
        'anime.name ILIKE :nameRu OR anime.name_english ILIKE :nameEn',
        { nameRu: `%${nameRu}%`, nameEn: `%${nameEn}%` },
      );
    } else if (nameRu) {
      queryBuilder.where('anime.name ILIKE :nameRu', {
        nameRu: `%${nameRu}%`,
      });
    } else if (nameEn) {
      queryBuilder.where('anime.name_english ILIKE :nameEn', {
        nameEn: `%${nameEn}%`,
      });
    }

    return queryBuilder.getOne();
  }

  /**
   * Маппит данные API релиза в формат сущности Anime
   */
  private mapApiReleaseDataToAnime(apiAnime: any): Partial<Anime> {
    return {
      external_id: apiAnime.id.toString(),
      name: apiAnime.name?.main || '',
      name_english: apiAnime.name?.english || '',
      image:
        apiAnime.poster?.optimized?.preview ||
        apiAnime.poster?.preview ||
        undefined,
      first_year: apiAnime.year,
      last_year: apiAnime.year,
      total_releases: 1,
      total_episodes: apiAnime.episodes_total || 0,
      total_duration_in_seconds: 0,
    };
  }
}
