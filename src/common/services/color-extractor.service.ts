import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ExtractedColors {
  dominant: string;
  palette: string[];
}

@Injectable()
export class ColorExtractorService {
  /**
   * Извлекает доминантный цвет и палитру из изображения по URL.
   * @param imageUrl URL изображения (должен быть доступен по сети)
   * @param paletteSize Количество цветов в палитре (по умолчанию 5)
   */
  async extractColorsFromUrl(
    imageUrl: string,
    paletteSize = 5,
  ): Promise<ExtractedColors | undefined> {
    try {
      // 1️⃣ Загружаем изображение
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(
          `Не удалось загрузить изображение: ${response.statusText}`,
        );
      }
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      // 2️⃣ Преобразуем изображение в массив пикселей RGB
      const { data } = await sharp(imageBuffer)
        .resize(200, 200, { fit: 'inside' }) // уменьшаем для скорости
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixels: RGB[] = [];
      for (let i = 0; i < data.length; i += 3) {
        pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      }

      // 3️⃣ Запускаем кластеризацию для получения палитры
      const clusters = this.kMeans(pixels, paletteSize, 10);

      // 4️⃣ Доминантный цвет — первый по яркости
      const dominant = clusters[0];

      return {
        dominant: this.rgbToHex(dominant),
        palette: clusters.map((c) => this.rgbToHex(c)),
      };
    } catch {
      return undefined;
    }
  }

  // ----------------- Вспомогательные функции -----------------

  private kMeans(pixels: RGB[], k: number, iterations: number): RGB[] {
    let centroids = [...pixels].sort(() => 0.5 - Math.random()).slice(0, k);

    for (let i = 0; i < iterations; i++) {
      const groups: RGB[][] = Array.from({ length: k }, () => []);

      // распределяем пиксели по ближайшему центроиду
      for (const p of pixels) {
        const nearest = this.findNearestCentroid(p, centroids);
        groups[nearest].push(p);
      }

      // пересчитываем центроиды
      centroids = groups.map((group) => this.averageColor(group));
    }

    // сортируем по яркости, чтобы первым шел наиболее "доминантный"
    return centroids.sort((a, b) => this.brightness(b) - this.brightness(a));
  }

  private findNearestCentroid(pixel: RGB, centroids: RGB[]): number {
    const distances = centroids.map((c) => this.colorDistance(pixel, c));
    return distances.indexOf(Math.min(...distances));
  }

  private averageColor(pixels: RGB[]): RGB {
    if (!pixels.length) return { r: 0, g: 0, b: 0 };
    const total = pixels.reduce(
      (acc, p) => {
        acc.r += p.r;
        acc.g += p.g;
        acc.b += p.b;
        return acc;
      },
      { r: 0, g: 0, b: 0 },
    );
    const count = pixels.length;
    return {
      r: Math.round(total.r / count),
      g: Math.round(total.g / count),
      b: Math.round(total.b / count),
    };
  }

  private colorDistance(a: RGB, b: RGB): number {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  }

  private brightness({ r, g, b }: RGB): number {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  private rgbToHex({ r, g, b }: RGB): string {
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }
}
