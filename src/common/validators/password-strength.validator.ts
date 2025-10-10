import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;

    // Минимальная длина 8 символов
    if (password.length < 8) return false;

    // Должен содержать хотя бы одну заглавную букву
    if (!/[A-Z]/.test(password)) return false;

    // Должен содержать хотя бы одну строчную букву
    if (!/[a-z]/.test(password)) return false;

    // Должен содержать хотя бы одну цифру
    if (!/\d/.test(password)) return false;

    // Должен содержать хотя бы один специальный символ
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;

    // Не должен содержать пробелы
    if (/\s/.test(password)) return false;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы, без пробелов';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
