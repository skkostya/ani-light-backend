import { IsStrongPasswordConstraint } from './password-strength.validator';

describe('PasswordStrengthValidator', () => {
  let validator: IsStrongPasswordConstraint;

  beforeEach(() => {
    validator = new IsStrongPasswordConstraint();
  });

  describe('validate', () => {
    it('should return true for strong password', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ng#Pass',
        'Test@2024',
        'ComplexP@ss1',
      ];

      strongPasswords.forEach((password) => {
        expect(validator.validate(password, {} as any)).toBe(true);
      });
    });

    it('should return false for weak passwords', () => {
      const weakPasswords = [
        '12345678', // only numbers
        'password', // only lowercase
        'PASSWORD', // only uppercase
        'Password', // no numbers or special chars
        'Pass123', // too short
        'Password123', // no special chars
        'Password!', // no numbers
        'Pass 123!', // contains space
        '', // empty
        'Pass@', // too short
      ];

      weakPasswords.forEach((password) => {
        const result = validator.validate(password, {} as any);
        expect(result).toBe(false);
      });
    });

    it('should return false for null or undefined', () => {
      expect(validator.validate(null as any, {} as any)).toBe(false);
      expect(validator.validate(undefined as any, {} as any)).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message', () => {
      const message = validator.defaultMessage({} as any);
      expect(message).toContain('минимум 8 символов');
      expect(message).toContain('заглавные и строчные буквы');
      expect(message).toContain('цифры и специальные символы');
      expect(message).toContain('без пробелов');
    });
  });
});
