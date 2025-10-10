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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateAgeRatingDto, UpdateAgeRatingDto } from '../dto/age-rating.dto';
import { AgeRatingService } from '../services/age-rating.service';

@Controller('age-ratings')
@UseGuards(JwtAuthGuard)
export class AgeRatingController {
  constructor(private readonly ageRatingService: AgeRatingService) {}

  @Post()
  create(@Body() createAgeRatingDto: CreateAgeRatingDto) {
    return this.ageRatingService.create(createAgeRatingDto);
  }

  @Get()
  findAll() {
    return this.ageRatingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ageRatingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgeRatingDto: UpdateAgeRatingDto,
  ) {
    return this.ageRatingService.update(id, updateAgeRatingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ageRatingService.remove(id);
  }
}
