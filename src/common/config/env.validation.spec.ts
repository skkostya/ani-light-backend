import { envValidationSchema } from './env.validation';

describe('Environment Validation', () => {
  describe('envValidationSchema', () => {
    it('should validate correct environment variables', () => {
      const validEnv = {
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: 5432,
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        JWT_SECRET: 'super-secret-jwt-key-with-minimum-32-characters',
        ANILIBRIA_API_URL: 'https://anilibria.top/api/v1',
        FRONTEND_URL: 'http://localhost:3000',
        NODE_ENV: 'development',
        PORT: 3001,
        LOG_LEVEL: 'info',
      };

      const { error } = envValidationSchema.validate(validEnv);
      expect(error).toBeUndefined();
    });

    it('should apply default values', () => {
      const minimalEnv = {
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        JWT_SECRET: 'super-secret-jwt-key-with-minimum-32-characters',
        ANILIBRIA_API_URL: 'https://anilibria.top/api/v1',
      };

      const { error, value } = envValidationSchema.validate(minimalEnv);
      expect(error).toBeUndefined();
      expect(value.POSTGRES_HOST).toBe('localhost');
      expect(value.POSTGRES_PORT).toBe(5432);
      expect(value.REDIS_HOST).toBe('localhost');
      expect(value.REDIS_PORT).toBe(6379);
      expect(value.FRONTEND_URL).toBe('http://localhost:3000');
      expect(value.NODE_ENV).toBe('development');
      expect(value.PORT).toBe(3001);
      expect(value.LOG_LEVEL).toBe('info');
    });

    it('should reject invalid JWT secret (too short)', () => {
      const invalidEnv = {
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        JWT_SECRET: 'short',
        ANILIBRIA_API_URL: 'https://anilibria.top/api/v1',
      };

      const { error } = envValidationSchema.validate(invalidEnv);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain(
        'length must be at least 32 characters',
      );
    });

    it('should reject invalid NODE_ENV', () => {
      const invalidEnv = {
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        JWT_SECRET: 'super-secret-jwt-key-with-minimum-32-characters',
        ANILIBRIA_API_URL: 'https://anilibria.top/api/v1',
        NODE_ENV: 'invalid',
      };

      const { error } = envValidationSchema.validate(invalidEnv);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be one of');
    });

    it('should reject invalid LOG_LEVEL', () => {
      const invalidEnv = {
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        JWT_SECRET: 'super-secret-jwt-key-with-minimum-32-characters',
        ANILIBRIA_API_URL: 'https://anilibria.top/api/v1',
        LOG_LEVEL: 'invalid',
      };

      const { error } = envValidationSchema.validate(invalidEnv);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be one of');
    });

    it('should reject invalid URL format', () => {
      const invalidEnv = {
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        JWT_SECRET: 'super-secret-jwt-key-with-minimum-32-characters',
        ANILIBRIA_API_URL: 'not-a-valid-url',
      };

      const { error } = envValidationSchema.validate(invalidEnv);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('must be a valid uri');
    });

    it('should require mandatory fields', () => {
      const incompleteEnv = {
        POSTGRES_USER: 'test_user',
        // Missing POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET, ANILIBRIA_API_URL
      };

      const { error } = envValidationSchema.validate(incompleteEnv);
      expect(error).toBeDefined();
      expect(error?.details.length).toBeGreaterThan(0);
    });

    it('should accept optional fields', () => {
      const envWithOptionals = {
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_password',
        POSTGRES_DB: 'test_db',
        JWT_SECRET: 'super-secret-jwt-key-with-minimum-32-characters',
        ANILIBRIA_API_URL: 'https://anilibria.top/api/v1',
        TELEGRAM_BOT_TOKEN: 'bot-token',
        CORS_ORIGIN: 'http://localhost:3000',
        RATE_LIMIT_TTL: 60000,
        RATE_LIMIT_MAX: 100,
      };

      const { error } = envValidationSchema.validate(envWithOptionals);
      expect(error).toBeUndefined();
    });
  });
});
