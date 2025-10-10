import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { SecurityAuditService } from '../../common/services/security-audit.service';
import { UpdateUserNotificationsDto } from './dto/user-notifications.dto';
import {
  CreateTelegramUserDto,
  CreateUserDto,
  JwtPayloadDto,
  LoginDto,
  UserResponseDto,
} from './dto/user.dto';
import { AuthType, User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private securityAuditService: SecurityAuditService,
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

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { telegram_id: telegramId } });
  }

  async registerTelegramUser(
    createTelegramUserDto: CreateTelegramUserDto,
  ): Promise<{ user: UserResponseDto; access_token: string }> {
    const { telegram_id, username, first_name, last_name, photo_url } =
      createTelegramUserDto;

    // Проверяем, не существует ли уже пользователь с таким telegram_id
    const existingUser = await this.findByTelegramId(telegram_id);
    if (existingUser) {
      // Если пользователь уже существует, просто генерируем новый токен
      const payload: JwtPayloadDto = {
        sub: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        subscription_type: existingUser.subscription_type,
        subscription_expires_at: existingUser.subscription_expires_at,
        auth_type: existingUser.auth_type,
        telegram_id: existingUser.telegram_id,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user: this.toUserResponse(existingUser),
        access_token,
      };
    }

    // Создаем нового пользователя
    const user = this.userRepository.create({
      telegram_id,
      username,
      auth_type: AuthType.TELEGRAM,
      subscription_type: 'free' as any, // Будет установлено по умолчанию
      is_active: true,
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
