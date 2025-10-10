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
  CreateUserEpisodeDto,
  MarkEpisodeWatchedDto,
  UpdateUserEpisodeDto,
} from './dto/user-episode.dto';
import { UserEpisodeService } from './user-episode.service';

@Controller('user/episodes')
@UseGuards(JwtAuthGuard)
export class UserEpisodeController {
  constructor(private readonly userEpisodeService: UserEpisodeService) {}

  @Post()
  create(@Request() req, @Body() createUserEpisodeDto: CreateUserEpisodeDto) {
    return this.userEpisodeService.create(req.user.id, createUserEpisodeDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.userEpisodeService.findByUser(req.user.id);
  }

  @Get('watched')
  getWatched(@Request() req) {
    return this.userEpisodeService.getWatchedEpisodes(req.user.id);
  }

  @Get('watching')
  getWatching(@Request() req) {
    return this.userEpisodeService.getWatchingEpisodes(req.user.id);
  }

  @Get(':episodeId')
  findOne(@Request() req, @Param('episodeId') episodeId: string) {
    return this.userEpisodeService.findOne(req.user.id, episodeId);
  }

  @Patch(':episodeId')
  update(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() updateUserEpisodeDto: UpdateUserEpisodeDto,
  ) {
    return this.userEpisodeService.update(
      req.user.id,
      episodeId,
      updateUserEpisodeDto,
    );
  }

  @Post(':episodeId/mark-watched')
  markAsWatched(
    @Request() req,
    @Param('episodeId') episodeId: string,
    @Body() markDto: MarkEpisodeWatchedDto,
  ) {
    return this.userEpisodeService.markAsWatched(
      req.user.id,
      episodeId,
      markDto,
    );
  }

  @Post(':episodeId/mark-watching')
  markAsWatching(@Request() req, @Param('episodeId') episodeId: string) {
    return this.userEpisodeService.markAsWatching(req.user.id, episodeId);
  }

  @Delete(':episodeId')
  remove(@Request() req, @Param('episodeId') episodeId: string) {
    return this.userEpisodeService.remove(req.user.id, episodeId);
  }
}
