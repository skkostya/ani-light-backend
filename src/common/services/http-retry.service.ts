import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { Observable } from 'rxjs';

@Injectable()
export class HttpRetryService {
  private readonly logger = new Logger(HttpRetryService.name);
  private readonly axiosInstance;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Создаем отдельный экземпляр axios с retry логикой
    this.axiosInstance = axios.create({
      timeout: 10000, // 10 секунд таймаут
      headers: {
        'User-Agent': 'ani-light-backend/1.0',
      },
    });

    // Настраиваем retry логику
    axiosRetry(this.axiosInstance, {
      retries: 3, // Максимум 3 попытки
      retryDelay: axiosRetry.exponentialDelay.bind(axiosRetry), // Экспоненциальная задержка
      retryCondition: (error) => {
        // Повторяем при сетевых ошибках или 5xx ошибках
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status !== undefined &&
            error.response.status >= 500 &&
            error.response.status < 600) ||
          error.response?.status === 429 // Too Many Requests
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        this.logger.warn(
          `Retry attempt ${retryCount} for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}. Error: ${error.message}`,
        );
      },
    });

    // Логирование успешных запросов
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.configService.get('NODE_ENV') === 'development') {
          this.logger.debug(
            `HTTP ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
          );
        }
        return response;
      },
      (error) => {
        this.logger.error(
          `HTTP Error: ${error.response?.status || 'Network Error'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          error.message,
        );
        return Promise.reject(new Error(error.message || 'HTTP Error'));
      },
    );
  }

  /**
   * GET запрос с retry логикой
   */
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.get(url, config);
  }

  /**
   * POST запрос с retry логикой
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.post(url, data, config);
  }

  /**
   * PUT запрос с retry логикой
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.put(url, data, config);
  }

  /**
   * DELETE запрос с retry логикой
   */
  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.delete(url, config);
  }

  /**
   * Совместимость с NestJS HttpService - возвращает Observable
   */
  getObservable<T = any>(
    url: string,
    config?: any,
  ): Observable<AxiosResponse<T>> {
    return new Observable((subscriber) => {
      this.get<T>(url, config)
        .then((response) => {
          subscriber.next(response);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }
}
