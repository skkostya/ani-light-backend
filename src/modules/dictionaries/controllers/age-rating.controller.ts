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
  AgeRatingResponseDto,
  CreateAgeRatingDto,
  UpdateAgeRatingDto,
} from '../dto/age-rating.dto';
import { AgeRatingService } from '../services/age-rating.service';

@ApiTags('dictionaries')
@Controller('age-ratings')
@UseGuards(JwtAuthGuard)
export class AgeRatingController {
  constructor(private readonly ageRatingService: AgeRatingService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать возрастной рейтинг',
    description: 'Создает новый возрастной рейтинг в справочнике',
  })
  @ApiBody({
    type: CreateAgeRatingDto,
    description: 'Данные для создания возрастного рейтинга',
  })
  @ApiResponse({
    status: 201,
    description: 'Возрастной рейтинг успешно создан',
    type: AgeRatingResponseDto,
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
    description: 'Возрастной рейтинг с таким значением уже существует',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  create(@Body() createAgeRatingDto: CreateAgeRatingDto) {
    return this.ageRatingService.create(createAgeRatingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все возрастные рейтинги',
    description: 'Возвращает список всех возрастных рейтингов',
  })
  @ApiResponse({
    status: 200,
    description: 'Список возрастных рейтингов успешно получен',
    type: [AgeRatingResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findAll() {
    return this.ageRatingService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить возрастной рейтинг по ID',
    description: 'Возвращает информацию о конкретном возрастном рейтинге',
  })
  @ApiParam({
    name: 'id',
    description: 'ID возрастного рейтинга',
    example: 'uuid-age-rating-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Возрастной рейтинг успешно получен',
    type: AgeRatingResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Возрастной рейтинг не найден',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  findOne(@Param('id') id: string) {
    return this.ageRatingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить возрастной рейтинг',
    description: 'Обновляет информацию о возрастном рейтинге',
  })
  @ApiParam({
    name: 'id',
    description: 'ID возрастного рейтинга',
    example: 'uuid-age-rating-id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateAgeRatingDto,
    description: 'Новые данные возрастного рейтинга',
  })
  @ApiResponse({
    status: 200,
    description: 'Возрастной рейтинг успешно обновлен',
    type: AgeRatingResponseDto,
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
    description: 'Возрастной рейтинг не найден',
  })
  @ApiResponse({
    status: 409,
    description: 'Возрастной рейтинг с таким значением уже существует',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  update(
    @Param('id') id: string,
    @Body() updateAgeRatingDto: UpdateAgeRatingDto,
  ) {
    return this.ageRatingService.update(id, updateAgeRatingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить возрастной рейтинг',
    description: 'Удаляет возрастной рейтинг из справочника',
  })
  @ApiParam({
    name: 'id',
    description: 'ID возрастного рейтинга',
    example: 'uuid-age-rating-id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Возрастной рейтинг успешно удален',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима аутентификация',
  })
  @ApiResponse({
    status: 404,
    description: 'Возрастной рейтинг не найден',
  })
  @ApiResponse({
    status: 409,
    description:
      'Невозможно удалить возрастной рейтинг, так как он используется в аниме',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  remove(@Param('id') id: string) {
    return this.ageRatingService.remove(id);
  }
}
