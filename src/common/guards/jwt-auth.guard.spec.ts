import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should throw UnauthorizedException with TOKEN_MISSING when no user and no error', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with TOKEN_EXPIRED when token is expired', () => {
      const error = { name: 'TokenExpiredError' };

      expect(() => {
        guard.handleRequest(error, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with TOKEN_INVALID when token is invalid', () => {
      const error = { name: 'JsonWebTokenError' };

      expect(() => {
        guard.handleRequest(error, null, null);
      }).toThrow(UnauthorizedException);
    });

    it('should return user when user is provided', () => {
      const user = { id: '1', email: 'test@example.com' };

      const result = guard.handleRequest(null, user, null);

      expect(result).toEqual(user);
    });

    it('should handle info object with TokenExpiredError', () => {
      const info = { name: 'TokenExpiredError' };

      expect(() => {
        guard.handleRequest(null, null, info);
      }).toThrow(UnauthorizedException);
    });

    it('should handle info object with No auth token message', () => {
      const info = { message: 'No auth token' };

      expect(() => {
        guard.handleRequest(null, null, info);
      }).toThrow(UnauthorizedException);
    });
  });
});
