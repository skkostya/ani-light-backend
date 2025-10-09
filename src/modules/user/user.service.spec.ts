import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { SubscriptionType, User } from './entities/user.entity';
import { UserService } from './user.service';

// Мокаем argon2
jest.mock('argon2');
const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: Partial<User> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    password_hash: 'hashedpassword',
    subscription_type: SubscriptionType.FREE,
    subscription_expires_at: undefined,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    hasActiveSubscription: false,
    shouldHideAds: false,
  };

  const mockPremiumUser: Partial<User> = {
    ...mockUser,
    id: '123e4567-e89b-12d3-a456-426614174001',
    subscription_type: SubscriptionType.PREMIUM,
    subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
    hasActiveSubscription: true,
    shouldHideAds: true,
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      userRepository.findOne.mockResolvedValue(null); // Пользователь не существует
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);
      mockedArgon2.hash.mockResolvedValue('hashedpassword');
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockedArgon2.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        username: createUserDto.username,
        password_hash: 'hashedpassword',
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result.user.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      mockedArgon2.verify.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        mockUser.password_hash,
        loginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      mockedArgon2.verify.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        mockUser.password_hash,
        loginDto.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, is_active: false };
      userRepository.findOne.mockResolvedValue(inactiveUser as User);
      mockedArgon2.verify.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedArgon2.verify).toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should return correct subscription info for premium user', async () => {
      userRepository.findOne.mockResolvedValue(mockPremiumUser as User);
      mockedArgon2.verify.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.user.subscription_type).toBe(SubscriptionType.PREMIUM);
      expect(result.user.hasActiveSubscription).toBe(true);
      expect(result.user.shouldHideAds).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      const userId = mockUser.id!;
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return null if user not found', async () => {
      const userId = 'non-existent-id';
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('validateUser', () => {
    it('should return user for valid payload', async () => {
      const payload = {
        sub: mockUser.id!,
        email: mockUser.email!,
        username: mockUser.username!,
        subscription_type: mockUser.subscription_type!,
      };
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.validateUser(payload);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
    });

    it('should return null for invalid payload', async () => {
      const payload = {
        sub: 'non-existent-id',
        email: 'test@example.com',
        username: 'testuser',
        subscription_type: SubscriptionType.FREE,
      };
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(payload);

      expect(result).toBeNull();
    });
  });
});
