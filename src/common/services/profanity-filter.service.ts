import { Injectable } from '@nestjs/common';
import * as profanityCheck from 'profanity-check';

@Injectable()
export class ProfanityFilterService {
  private filter: any;

  // Список русских матов для дополнительной проверки
  private russianProfanityWords = [
    'блядь',
    'сука',
    'хуй',
    'пизда',
    'ебать',
    'ебаный',
    'ебанутый',
    'заебал',
    'заебать',
    'нахуй',
    'похуй',
    'хуйня',
    'пиздец',
    'бля',
    'блять',
    'ебать-копать',
    'ебаный в рот',
    'иди нахуй',
    'пошел нахуй',
    'иди в пизду',
    'пошел в пизду',
  ];

  constructor() {
    this.filter = new profanityCheck.Filter();
  }

  /**
   * Проверяет, содержит ли текст нецензурную лексику
   */
  isProfane(text: string): boolean {
    // Проверяем с помощью библиотеки profanity-check
    const hasProfanity = this.filter.isProfane(text);

    // Дополнительная проверка русских матов
    const hasRussianProfanity = this.russianProfanityWords.some((word) =>
      text.toLowerCase().includes(word.toLowerCase()),
    );

    return hasProfanity || hasRussianProfanity;
  }

  /**
   * Заменяет нецензурные слова на звездочки
   */
  clean(text: string): string {
    let cleanedText = text;

    // Заменяем русские маты
    this.russianProfanityWords.forEach((word) => {
      const regex = new RegExp(word, 'gi');
      cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
    });

    // Заменяем английские маты (основные)
    const englishProfanityWords = [
      'fuck',
      'fucking',
      'fucked',
      'fucker',
      'shit',
      'shitty',
      'shitting',
      'damn',
      'damned',
      'damning',
      'bitch',
      'bitches',
      'bitching',
      'ass',
      'asses',
      'asshole',
      'crap',
      'crappy',
      'hell',
      'hellish',
    ];

    englishProfanityWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
    });

    return cleanedText;
  }

  /**
   * Проверяет и очищает текст, возвращает результат
   */
  validateAndClean(text: string): {
    isClean: boolean;
    cleanedText: string;
    originalText: string;
  } {
    const isClean = !this.isProfane(text);
    const cleanedText = this.clean(text);

    return {
      isClean,
      cleanedText,
      originalText: text,
    };
  }
}
