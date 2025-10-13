import { Test, TestingModule } from '@nestjs/testing';
import { AnimeReleaseController } from './anime-release.controller';
import { AnimeReleaseService } from './anime-release.service';

describe('AnimeReleaseController', () => {
  let controller: AnimeReleaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnimeReleaseController],
      providers: [AnimeReleaseService],
    }).compile();

    controller = module.get<AnimeReleaseController>(AnimeReleaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
