import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { AnimeService } from './anime.service';
import { GetAnimeListDto, SearchDto } from './dto/anime.dto';

@Controller('anime')
@UseGuards(OptionalJwtGuard) // Применяем опциональную аутентификацию ко всем эндпоинтам
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  async getAnimeList(@Query() query: GetAnimeListDto, @Request() req: any) {
    const result = await this.animeService.getAnimeList(query);

    // Добавляем информацию о том, нужно ли показывать рекламу
    return {
      ...result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }

  @Get('search')
  @Throttle({ short: { limit: 2, ttl: 1000 } }) // Более строгий лимит для поиска
  async searchAnime(@Query() query: SearchDto, @Request() req: any) {
    const result = await this.animeService.searchAnime(query.q);

    return {
      results: result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }

  @Get('sync')
  async syncAnimeData() {
    // Проверяем, что пользователь аутентифицирован (опционально)
    // if (!req.user) {
    //   throw new UnauthorizedException('Требуется аутентификация');
    // }

    await this.animeService.syncAnimeData();
    return { message: 'Синхронизация данных завершена' };
  }

  @Get(':id')
  async getAnimeDetails(@Param() params: UuidParamDto, @Request() req: any) {
    const result = await this.animeService.getAnimeDetails(params.id);

    return {
      ...result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }

  @Get(':id/episodes')
  async getEpisodes(@Param() params: UuidParamDto, @Request() req: any) {
    const result = await this.animeService.getEpisodes(params.id);

    return {
      episodes: result,
      shouldHideAds: req.user?.shouldHideAds || false,
      user: req.user
        ? {
            id: req.user.id,
            username: req.user.username,
            subscription_type: req.user.subscription_type,
          }
        : null,
    };
  }
}
