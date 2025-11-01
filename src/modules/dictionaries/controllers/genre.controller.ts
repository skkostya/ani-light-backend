import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  CreateGenreDto,
  GenreResponseDto,
  UpdateGenreDto,
} from '../dto/genre.dto';
import { GenreService } from '../services/genre.service';

@ApiTags('dictionaries')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Создать жанр',
    description: 'Создает новый жанр в справочнике',
  })
  @ApiBody({
    type: CreateGenreDto,
    description: 'Данные для создания жанра',
  })
  @ApiResponse({
    status: 201,
    description: 'Жанр успешно создан',
    type: GenreResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 409,
    description: 'Жанр с таким external_id уже существует',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все жанры',
    description: 'Возвращает список всех жанров',
  })
  @ApiResponse({
    status: 200,
    description: 'Список жанров успешно получен',
    type: [GenreResponseDto],
  })
  findAll() {
    return this.genreService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить жанр по ID',
    description: 'Возвращает информацию о конкретном жанре',
  })
  @ApiParam({
    name: 'id',
    description: 'ID жанра',
    example: 'uuid-genre-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Жанр успешно получен',
    type: GenreResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Жанр не найден',
  })
  findOne(@Param('id') id: string) {
    return this.genreService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Обновить жанр',
    description: 'Обновляет информацию о жанре',
  })
  @ApiParam({
    name: 'id',
    description: 'ID жанра',
    example: 'uuid-genre-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateGenreDto,
    description: 'Новые данные жанра',
  })
  @ApiResponse({
    status: 200,
    description: 'Жанр успешно обновлен',
    type: GenreResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Жанр не найден',
  })
  @ApiResponse({
    status: 409,
    description: 'Жанр с таким external_id уже существует',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Удалить жанр',
    description: 'Удаляет жанр из справочника',
  })
  @ApiParam({
    name: 'id',
    description: 'ID жанра',
    example: 'uuid-genre-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Жанр успешно удален',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Жанр не найден',
  })
  @ApiResponse({
    status: 409,
    description: 'Невозможно удалить жанр, так как он используется в аниме',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  remove(@Param('id') id: string) {
    return this.genreService.remove(id);
  }
}
