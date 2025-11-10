import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { TelegramService } from '../telegram/services/telegram.service';
import { UpdateUserNotificationsDto } from './dto/user-notifications.dto';
import {
  // DTOs для стандартной аутентификации
  CreateTelegramUserDto,
  CreateUserDto,
  JwtPayloadDto,
  LoginDto,
  UserResponseDto,
} from './dto/user.dto';
import { AuthType, User } from './entities/user.entity';

dotenv.config();
const configService = new ConfigService();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private telegramService: TelegramService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: UserResponseDto; access_token: string }> {
    const { email, username, password } = createUserDto;

    // Проверяем, не существует ли пользователь с таким email
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хэшируем пароль
    const password_hash = await argon2.hash(password);

    // Создаем пользователя
    const user = this.userRepository.create({
      email,
      username,
      password_hash,
    });

    const savedUser = await this.userRepository.save(user);

    // Генерируем JWT токен
    const payload: JwtPayloadDto = {
      sub: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      subscription_type: savedUser.subscription_type,
      subscription_expires_at: savedUser.subscription_expires_at,
      auth_type: savedUser.auth_type,
      telegram_id: savedUser.telegram_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: this.toUserResponse(savedUser),
      access_token,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: UserResponseDto; access_token: string }> {
    const { email, password } = loginDto;

    // Находим пользователя
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await argon2.verify(user.password_hash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем, активен ли пользователь
    if (!user.is_active) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Генерируем JWT токен
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      username: user.username,
      subscription_type: user.subscription_type,
      subscription_expires_at: user.subscription_expires_at,
      auth_type: user.auth_type,
      telegram_id: user.telegram_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: this.toUserResponse(user),
      access_token,
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async validateUser(payload: JwtPayloadDto): Promise<User | null> {
    return this.findById(payload.sub);
  }

  async updateNotifications(
    userId: string,
    updateDto: UpdateUserNotificationsDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }

  /**
   * Регистрация или логин пользователя через Telegram
   * Автоматически определяет, нужно ли регистрировать нового пользователя или логинить существующего
   * @param createTelegramUserDto - данные пользователя из Telegram
   * @returns пользователь и JWT токен
   */
  async registerTelegramUser(
    createTelegramUserDto: CreateTelegramUserDto,
  ): Promise<{ user: UserResponseDto; access_token: string }> {
    let telegramUserData: {
      telegram_id: string;
      username: string;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    };

    // Если передан initData, верифицируем его и извлекаем данные пользователя
    if (createTelegramUserDto.initData) {
      try {
        const verifiedData = this.telegramService.verifyInitData(
          createTelegramUserDto.initData,
        );
        const userFromInitData =
          this.telegramService.getUserFromInitData(verifiedData);

        if (userFromInitData) {
          // Используем данные из верифицированного initData
          telegramUserData = {
            telegram_id: userFromInitData.id.toString(),
            username:
              userFromInitData.username ||
              `${userFromInitData.first_name}${
                userFromInitData.last_name
                  ? `_${userFromInitData.last_name}`
                  : ''
              }`,
            first_name: userFromInitData.first_name,
            last_name: userFromInitData.last_name,
            photo_url: userFromInitData.photo_url,
          };
        } else {
          throw new UnauthorizedException(
            'Не удалось извлечь данные пользователя из initData',
          );
        }
      } catch {
        // Если верификация не удалась, проверяем наличие прямых данных
        if (
          !createTelegramUserDto.telegram_id ||
          !createTelegramUserDto.username
        ) {
          throw new UnauthorizedException(
            'Для авторизации через Telegram требуется либо initData, либо telegram_id и username',
          );
        }
        // Используем прямые данные как fallback
        telegramUserData = {
          telegram_id: createTelegramUserDto.telegram_id,
          username: createTelegramUserDto.username,
          first_name: createTelegramUserDto.first_name,
          last_name: createTelegramUserDto.last_name,
          photo_url: createTelegramUserDto.photo_url,
        };
      }
    } else {
      // initData не передан, используем прямые данные
      if (
        !createTelegramUserDto.telegram_id ||
        !createTelegramUserDto.username
      ) {
        throw new UnauthorizedException(
          'Требуется либо initData, либо telegram_id и username',
        );
      }
      telegramUserData = {
        telegram_id: createTelegramUserDto.telegram_id,
        username: createTelegramUserDto.username,
        first_name: createTelegramUserDto.first_name,
        last_name: createTelegramUserDto.last_name,
        photo_url: createTelegramUserDto.photo_url,
      };
    }

    // Ищем существующего пользователя по telegram_id
    let user = await this.userRepository.findOne({
      where: { telegram_id: telegramUserData.telegram_id },
    });

    if (user) {
      // Пользователь существует - обновляем данные и логиним
      // Обновляем username, если он изменился
      if (
        telegramUserData.username &&
        user.username !== telegramUserData.username
      ) {
        user.username = telegramUserData.username;
        await this.userRepository.save(user);
      }
    } else {
      // Пользователя нет - регистрируем нового

      // Проверяем, не занят ли username другим пользователем
      const existingUsername = await this.userRepository.findOne({
        where: { username: telegramUserData.username },
      });

      if (existingUsername) {
        // Если username занят, добавляем суффикс с telegram_id
        telegramUserData.username = `${telegramUserData.username}_${telegramUserData.telegram_id.slice(-4)}`;
      }

      // Проверяем еще раз после изменения
      const stillExisting = await this.userRepository.findOne({
        where: { username: telegramUserData.username },
      });

      if (stillExisting) {
        // Если все еще занят, добавляем временную метку
        telegramUserData.username = `${telegramUserData.username}_${Date.now()}`;
      }

      // Создаем нового пользователя
      const newUser = this.userRepository.create({
        telegram_id: telegramUserData.telegram_id,
        username: telegramUserData.username,
        auth_type: AuthType.TELEGRAM,
      } as Partial<User>);

      user = await this.userRepository.save(newUser);
    }

    // Проверяем, активен ли пользователь
    if (!user.is_active) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Генерируем JWT токен
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      username: user.username,
      subscription_type: user.subscription_type,
      subscription_expires_at: user.subscription_expires_at,
      auth_type: user.auth_type,
      telegram_id: user.telegram_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: this.toUserResponse(user),
      access_token,
    };
  }

  /**
   * Логин пользователя через Telegram ID
   * @param telegramId - Telegram ID пользователя
   * @returns пользователь и JWT токен
   */
  async loginTelegramUser(
    telegramId: string,
  ): Promise<{ user: UserResponseDto; access_token: string }> {
    // Находим пользователя по telegram_id
    const user = await this.userRepository.findOne({
      where: { telegram_id: telegramId },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Пользователь с таким Telegram ID не найден',
      );
    }

    // Проверяем тип аутентификации
    if (user.auth_type !== AuthType.TELEGRAM) {
      throw new UnauthorizedException(
        'Пользователь не авторизован через Telegram',
      );
    }

    // Проверяем, активен ли пользователь
    if (!user.is_active) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Генерируем JWT токен
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      username: user.username,
      subscription_type: user.subscription_type,
      subscription_expires_at: user.subscription_expires_at,
      auth_type: user.auth_type,
      telegram_id: user.telegram_id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: this.toUserResponse(user),
      access_token,
    };
  }

  /**
   * Выпуск краткоживущего временного токена для Telegram-флоу.
   * Токен содержит только telegram_id и маркер типа.
   */
  issueTelegramTemporaryToken(telegramId: string): string {
    // Короткий TTL для безопасности
    const tempPayload = {
      telegram_id: telegramId,
      token_type: configService.get('TELEGARM_TEMP_TOKEN_TYPE'),
    };
    return this.jwtService.sign(tempPayload, { expiresIn: '5m' });
  }

  /**
   * Обмен временного токена (из Mini App/бота) на обычный JWT токен пользователя.
   * Валидирует временный токен, получает пользователя по telegram_id и выдает стандартный access_token.
   */
  async exchangeTelegramTemporaryToken(
    temporaryToken: string,
  ): Promise<{ user: UserResponseDto; access_token: string }> {
    try {
      const decoded: any = this.jwtService.verify(temporaryToken);

      if (
        !decoded?.telegram_id ||
        decoded?.token_type !== configService.get('TELEGARM_TEMP_TOKEN_TYPE')
      ) {
        throw new UnauthorizedException('Недействительный временный токен');
      }

      // Авторизуем пользователя по telegram_id (пользователь должен существовать и быть активным)
      const telegramId = String(decoded.telegram_id);
      return this.loginTelegramUser(telegramId);
    } catch {
      throw new UnauthorizedException('Временный токен невалиден или истек');
    }
  }

  private toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      subscription_type: user.subscription_type,
      subscription_expires_at: user.subscription_expires_at,
      hasActiveSubscription: user.hasActiveSubscription,
      shouldHideAds: user.shouldHideAds,
      auth_type: user.auth_type,
      telegram_id: user.telegram_id,
      created_at: user.created_at,
    };
  }
}
