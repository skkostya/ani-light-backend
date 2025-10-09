import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUserTable1756932748350 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем enum для типов подписки
    await queryRunner.query(`
      CREATE TYPE "subscription_type_enum" AS ENUM('free', 'premium', 'vip')
    `);

    // Создаем таблицу пользователей
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'subscription_type',
            type: 'enum',
            enum: ['free', 'premium', 'vip'],
            default: "'free'",
            isNullable: false,
          },
          {
            name: 'subscription_expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Создаем индекс для email (уникальность уже обеспечена выше)
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_user_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // Создаем индекс для активных пользователей
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_user_is_active',
        columnNames: ['is_active'],
      }),
    );

    // Создаем индекс для типа подписки
    await queryRunner.createIndex(
      'user',
      new TableIndex({
        name: 'IDX_user_subscription_type',
        columnNames: ['subscription_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индексы
    await queryRunner.dropIndex('user', 'IDX_user_subscription_type');
    await queryRunner.dropIndex('user', 'IDX_user_is_active');
    await queryRunner.dropIndex('user', 'IDX_user_email');

    // Удаляем таблицу
    await queryRunner.dropTable('user');

    // Удаляем enum
    await queryRunner.query(`DROP TYPE "subscription_type_enum"`);
  }
}
