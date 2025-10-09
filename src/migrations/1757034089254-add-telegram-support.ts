import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTelegramSupport1757034089254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем новые колонки в таблицу user
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'telegram_id',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
      new TableColumn({
        name: 'auth_type',
        type: 'enum',
        enum: ['email', 'telegram'],
        default: "'email'",
        isNullable: false,
      }),
    ]);

    // Делаем email и password_hash nullable для Telegram пользователей
    await queryRunner.changeColumn(
      'user',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    await queryRunner.changeColumn(
      'user',
      'password_hash',
      new TableColumn({
        name: 'password_hash',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем NOT NULL для email и password_hash
    await queryRunner.changeColumn(
      'user',
      'email',
      new TableColumn({
        name: 'email',
        type: 'varchar',
        isNullable: false,
        isUnique: true,
      }),
    );

    await queryRunner.changeColumn(
      'user',
      'password_hash',
      new TableColumn({
        name: 'password_hash',
        type: 'varchar',
        isNullable: false,
      }),
    );

    // Удаляем новые колонки
    await queryRunner.dropColumns('user', ['auth_type', 'telegram_id']);
  }
}
