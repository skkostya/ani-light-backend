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
import {
  CreateEpisodeRatingDto,
  UpdateEpisodeRatingDto,
} from './dto/episode-rating.dto';
import { EpisodeRatingService } from './episode-rating.service';

@Controller('episodes/:episodeId/ratings')
export class EpisodeRatingController {
  constructor(private readonly ratingService: EpisodeRatingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() createDto: CreateEpisodeRatingDto,
  ) {
    return this.ratingService.create(req.user.id, {
      ...createDto,
      episode_id: episodeId,
    });
  }

  @Get()
  findAll(@Param('episodeId') episodeId: string) {
    return this.ratingService.findByEpisode(episodeId);
  }

  @Get('average')
  getAverage(@Param('episodeId') episodeId: string) {
    return this.ratingService.getAverageRating(episodeId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@Request() req, @Param('episodeId') episodeId: string) {
    return this.ratingService.findOne(req.user.id, episodeId);
  }

  @Patch('my')
  @UseGuards(JwtAuthGuard)
  updateMy(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() updateDto: UpdateEpisodeRatingDto,
  ) {
    return this.ratingService.update(req.user.id, episodeId, updateDto);
  }

  @Delete('my')
  @UseGuards(JwtAuthGuard)
  removeMy(@Request() req, @Param('episodeId') episodeId: string) {
    return this.ratingService.remove(req.user.id, episodeId);
  }
}
