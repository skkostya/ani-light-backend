import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);
  private readonly securityLogger = new Logger('SecurityAudit');

  /**
   * Логирует событие безопасности
   */
  logSecurityEvent(event: SecurityEvent): void {
    const logMessage = {
      event: event.type,
      userId: event.userId,
      email: event.email,
      ip: event.ip,
      userAgent: event.userAgent,
      timestamp: event.timestamp.toISOString(),
      details: event.details,
      severity: event.severity,
    };

    // Логируем в зависимости от уровня серьезности
    switch (event.severity) {
      case 'CRITICAL':
        this.securityLogger.error('CRITICAL Security Event', logMessage);
        break;
      case 'HIGH':
        this.securityLogger.warn('HIGH Security Event', logMessage);
        break;
      case 'MEDIUM':
        this.securityLogger.warn('MEDIUM Security Event', logMessage);
        break;
      case 'LOW':
        this.securityLogger.log('LOW Security Event', logMessage);
        break;
    }
  }

  /**
   * Логирует успешный вход
   */
  logLoginSuccess(userId: string, email: string, request: Request): void {
    this.logSecurityEvent({
      type: SecurityEventType.LOGIN_SUCCESS,
      userId,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      severity: 'LOW',
    });
  }

  /**
   * Логирует неудачную попытку входа
   */
  logLoginFailed(email: string, request: Request, reason?: string): void {
    this.logSecurityEvent({
      type: SecurityEventType.LOGIN_FAILED,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { reason },
      severity: 'MEDIUM',
    });
  }

  /**
   * Логирует успешную регистрацию
   */
  logRegistrationSuccess(
    userId: string,
    email: string,
    request: Request,
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.REGISTRATION_SUCCESS,
      userId,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      severity: 'LOW',
    });
  }

  /**
   * Логирует неудачную регистрацию
   */
  logRegistrationFailed(
    email: string,
    request: Request,
    reason?: string,
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.REGISTRATION_FAILED,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { reason },
      severity: 'MEDIUM',
    });
  }

  /**
   * Логирует смену пароля
   */
  logPasswordChange(userId: string, email: string, request: Request): void {
    this.logSecurityEvent({
      type: SecurityEventType.PASSWORD_CHANGE,
      userId,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      severity: 'HIGH',
    });
  }

  /**
   * Логирует подозрительную активность
   */
  logSuspiciousActivity(
    userId: string | undefined,
    email: string | undefined,
    request: Request,
    activity: string,
    details?: Record<string, any>,
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { activity, ...details },
      severity: 'HIGH',
    });
  }

  /**
   * Логирует превышение лимита запросов
   */
  logRateLimitExceeded(request: Request, limit: number, window: number): void {
    this.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { limit, window, endpoint: request.url },
      severity: 'MEDIUM',
    });
  }

  /**
   * Логирует неавторизованный доступ
   */
  logUnauthorizedAccess(request: Request, reason?: string): void {
    this.logSecurityEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { reason, endpoint: request.url },
      severity: 'HIGH',
    });
  }

  /**
   * Логирует недействительный токен
   */
  logInvalidToken(request: Request, tokenType: string): void {
    this.logSecurityEvent({
      type: SecurityEventType.INVALID_TOKEN,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { tokenType, endpoint: request.url },
      severity: 'MEDIUM',
    });
  }

  /**
   * Логирует блокировку аккаунта
   */
  logAccountLocked(
    userId: string,
    email: string,
    request: Request,
    reason: string,
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.ACCOUNT_LOCKED,
      userId,
      email,
      ip: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
      details: { reason },
      severity: 'CRITICAL',
    });
  }

  /**
   * Получает IP адрес клиента с учетом прокси
   */
  private getClientIP(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
