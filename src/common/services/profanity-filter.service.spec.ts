import { Test, TestingModule } from '@nestjs/testing';
import { ProfanityFilterService } from './profanity-filter.service';

describe('ProfanityFilterService', () => {
  let service: ProfanityFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfanityFilterService],
    }).compile();

    service = module.get<ProfanityFilterService>(ProfanityFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isProfane', () => {
    it('should detect profane words', () => {
      expect(service.isProfane('This is a fucking good test')).toBe(true);
    });

    it('should detect Russian profanity', () => {
      expect(service.isProfane('Это блядь хороший тест')).toBe(true);
    });

    it('should not detect clean text', () => {
      expect(service.isProfane('This is a clean text')).toBe(false);
    });

    it('should not detect clean Russian text', () => {
      expect(service.isProfane('Это хороший тест')).toBe(false);
    });
  });

  describe('clean', () => {
    it('should clean profane words', () => {
      const result = service.clean('This is a fucking good test');
      expect(result).toContain('*******');
    });

    it('should clean Russian profanity', () => {
      const result = service.clean('Это блядь хороший тест');
      expect(result).toContain('*****');
    });

    it('should not change clean text', () => {
      const result = service.clean('This is a clean text');
      expect(result).toBe('This is a clean text');
    });
  });

  describe('validateAndClean', () => {
    it('should return clean validation for profane text', () => {
      const result = service.validateAndClean('This is a fucking good test');
      expect(result.isClean).toBe(false);
      expect(result.cleanedText).toContain('*******');
      expect(result.originalText).toBe('This is a fucking good test');
    });

    it('should return clean validation for clean text', () => {
      const result = service.validateAndClean('This is a clean text');
      expect(result.isClean).toBe(true);
      expect(result.cleanedText).toBe('This is a clean text');
      expect(result.originalText).toBe('This is a clean text');
    });
  });
});
