import { Controller, Get, Param, Query } from '@nestjs/common';
import { UuidParamDto } from '../../common/dto/uuid-param.dto';
import { GetEpisodesDto } from './dto/episode.dto';
import { EpisodeService } from './episode.service';

@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  async getEpisodes(@Query() query: GetEpisodesDto) {
    return this.episodeService.getEpisodes(query.animeId);
  }

  @Get(':id')
  async getEpisodeDetails(@Param() params: UuidParamDto) {
    return this.episodeService.getEpisodeDetails(params.id);
  }
}
