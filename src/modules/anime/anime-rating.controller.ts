import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnimeRatingService } from './anime-rating.service';
import {
  CreateAnimeRatingDto,
  UpdateAnimeRatingDto,
} from './dto/anime-rating.dto';

@Controller('anime/:animeId/ratings')
export class AnimeRatingController {
  constructor(private readonly ratingService: AnimeRatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req,
    @Param('animeId') animeId: string,
    @Body() createDto: CreateAnimeRatingDto,
  ) {
    return this.ratingService.create(req.user.id, {
      ...createDto,
      anime_id: animeId,
    });
  }

  @Get()
  findAll(@Param('animeId') animeId: string) {
    return this.ratingService.findByAnime(animeId);
  }

  @Get('average')
  getAverage(@Param('animeId') animeId: string) {
    return this.ratingService.getAverageRating(animeId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@Request() req, @Param('animeId') animeId: string) {
    return this.ratingService.findOne(req.user.id, animeId);
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard)
  updateMy(
    @Request() req,
    @Param('animeId') animeId: string,
    @Body() updateDto: UpdateAnimeRatingDto,
  ) {
    return this.ratingService.update(req.user.id, animeId, updateDto);
  }

  @Delete('my')
  @UseGuards(JwtAuthGuard)
  removeMy(@Request() req, @Param('animeId') animeId: string) {
    return this.ratingService.remove(req.user.id, animeId);
  }
}
