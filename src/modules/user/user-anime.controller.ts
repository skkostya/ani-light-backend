import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserAnimeDto, UpdateUserAnimeDto } from './dto/user-anime.dto';
import { UserAnimeService } from './user-anime.service';

@Controller('user/anime')
@UseGuards(JwtAuthGuard)
export class UserAnimeController {
  constructor(private readonly userAnimeService: UserAnimeService) {}

  @Post()
  create(@Request() req, @Body() createUserAnimeDto: CreateUserAnimeDto) {
    return this.userAnimeService.create(req.user.id, createUserAnimeDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.userAnimeService.findByUser(req.user.id);
  }

  @Get('favorites')
  getFavorites(@Request() req) {
    return this.userAnimeService.getFavorites(req.user.id);
  }

  @Get('want-to-watch')
  getWantToWatch(@Request() req) {
    return this.userAnimeService.getWantToWatch(req.user.id);
  }

  @Get(':animeId')
  findOne(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.findOne(req.user.id, animeId);
  }

  @Patch(':animeId')
  update(
    @Request() req,
    @Param('animeId') animeId: string,
    @Body() updateUserAnimeDto: UpdateUserAnimeDto,
  ) {
    return this.userAnimeService.update(
      req.user.id,
      animeId,
      updateUserAnimeDto,
    );
  }

  @Post(':animeId/toggle-favorite')
  toggleFavorite(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.toggleFavorite(req.user.id, animeId);
  }

  @Post(':animeId/toggle-want-to-watch')
  toggleWantToWatch(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.toggleWantToWatch(req.user.id, animeId);
  }

  @Delete(':animeId')
  remove(@Request() req, @Param('animeId') animeId: string) {
    return this.userAnimeService.remove(req.user.id, animeId);
  }
}
