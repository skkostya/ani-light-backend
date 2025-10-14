import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class UserRelationships1760063795540 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем настройки уведомлений в таблицу user
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'notifications_enabled',
        type: 'boolean',
        default: true,
      }),
      new TableColumn({
        name: 'notifications_telegram_enabled',
        type: 'boolean',
        default: true,
      }),
      new TableColumn({
        name: 'notifications_email_enabled',
        type: 'boolean',
        default: true,
      }),
    ]);

    // Создаем таблицу user_anime
    await queryRunner.createTable(
      new Table({
        name: 'user_anime',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'anime_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'is_favorite',
            type: 'boolean',
            default: false,
          },
          {
            name: 'want_to_watch',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notifications_telegram',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notifications_email',
            type: 'boolean',
            default: false,
          },
          {
            name: 'rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создаем таблицу user_episode
    await queryRunner.createTable(
      new Table({
        name: 'user_episode',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'episode_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['not_watched', 'watching', 'watched'],
            default: "'not_watched'",
          },
          {
            name: 'last_watched_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'watched_until_end_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создаем таблицу episode_comment
    await queryRunner.createTable(
      new Table({
        name: 'episode_comment',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'episode_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'parent_comment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_approved',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создаем таблицу comment_reaction
    await queryRunner.createTable(
      new Table({
        name: 'comment_reaction',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'comment_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reaction_type',
            type: 'enum',
            enum: ['like', 'dislike'],
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создаем таблицу anime_rating
    await queryRunner.createTable(
      new Table({
        name: 'anime_rating',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'anime_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'rating',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создаем таблицу episode_rating
    await queryRunner.createTable(
      new Table({
        name: 'episode_rating',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'episode_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'rating',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Создаем индексы для производительности
    await queryRunner.createIndex(
      'user_anime',
      new TableIndex({
        name: 'IDX_user_anime_user_anime_unique',
        columnNames: ['user_id', 'anime_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user_episode',
      new TableIndex({
        name: 'IDX_user_episode_user_episode_unique',
        columnNames: ['user_id', 'episode_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'comment_reaction',
      new TableIndex({
        name: 'IDX_comment_reaction_user_comment_unique',
        columnNames: ['user_id', 'comment_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'anime_rating',
      new TableIndex({
        name: 'IDX_anime_rating_user_anime_unique',
        columnNames: ['user_id', 'anime_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'episode_rating',
      new TableIndex({
        name: 'IDX_episode_rating_user_episode_unique',
        columnNames: ['user_id', 'episode_id'],
        isUnique: true,
      }),
    );

    // Создаем внешние ключи
    await queryRunner.query(`
            ALTER TABLE "user_anime" 
            ADD CONSTRAINT "FK_user_anime_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "user_anime" 
            ADD CONSTRAINT "FK_user_anime_anime_id" 
            FOREIGN KEY ("anime_id") REFERENCES "anime_release"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "user_episode" 
            ADD CONSTRAINT "FK_user_episode_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "user_episode" 
            ADD CONSTRAINT "FK_user_episode_episode_id" 
            FOREIGN KEY ("episode_id") REFERENCES "episode"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "episode_comment" 
            ADD CONSTRAINT "FK_episode_comment_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "episode_comment" 
            ADD CONSTRAINT "FK_episode_comment_episode_id" 
            FOREIGN KEY ("episode_id") REFERENCES "episode"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "episode_comment" 
            ADD CONSTRAINT "FK_episode_comment_parent_id" 
            FOREIGN KEY ("parent_comment_id") REFERENCES "episode_comment"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "comment_reaction" 
            ADD CONSTRAINT "FK_comment_reaction_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "comment_reaction" 
            ADD CONSTRAINT "FK_comment_reaction_comment_id" 
            FOREIGN KEY ("comment_id") REFERENCES "episode_comment"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "anime_rating" 
            ADD CONSTRAINT "FK_anime_rating_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "anime_rating" 
            ADD CONSTRAINT "FK_anime_rating_anime_id" 
            FOREIGN KEY ("anime_id") REFERENCES "anime_release"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "episode_rating" 
            ADD CONSTRAINT "FK_episode_rating_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "episode_rating" 
            ADD CONSTRAINT "FK_episode_rating_episode_id" 
            FOREIGN KEY ("episode_id") REFERENCES "episode"("id") ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешние ключи
    await queryRunner.query(
      `ALTER TABLE "episode_rating" DROP CONSTRAINT "FK_episode_rating_episode_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "episode_rating" DROP CONSTRAINT "FK_episode_rating_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "anime_rating" DROP CONSTRAINT "FK_anime_rating_anime_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "anime_rating" DROP CONSTRAINT "FK_anime_rating_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_comment_reaction_comment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_reaction" DROP CONSTRAINT "FK_comment_reaction_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "episode_comment" DROP CONSTRAINT "FK_episode_comment_parent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "episode_comment" DROP CONSTRAINT "FK_episode_comment_episode_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "episode_comment" DROP CONSTRAINT "FK_episode_comment_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_episode" DROP CONSTRAINT "FK_user_episode_episode_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_episode" DROP CONSTRAINT "FK_user_episode_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_anime" DROP CONSTRAINT "FK_user_anime_anime_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_anime" DROP CONSTRAINT "FK_user_anime_user_id"`,
    );

    // Удаляем индексы
    await queryRunner.dropIndex(
      'episode_rating',
      'IDX_episode_rating_user_episode_unique',
    );
    await queryRunner.dropIndex(
      'anime_rating',
      'IDX_anime_rating_user_anime_unique',
    );
    await queryRunner.dropIndex(
      'comment_reaction',
      'IDX_comment_reaction_user_comment_unique',
    );
    await queryRunner.dropIndex(
      'user_episode',
      'IDX_user_episode_user_episode_unique',
    );
    await queryRunner.dropIndex(
      'user_anime',
      'IDX_user_anime_user_anime_unique',
    );

    // Удаляем таблицы
    await queryRunner.dropTable('episode_rating');
    await queryRunner.dropTable('anime_rating');
    await queryRunner.dropTable('comment_reaction');
    await queryRunner.dropTable('episode_comment');
    await queryRunner.dropTable('user_episode');
    await queryRunner.dropTable('user_anime');

    // Удаляем колонки из user
    await queryRunner.dropColumns('user', [
      'notifications_enabled',
      'notifications_telegram_enabled',
      'notifications_email_enabled',
    ]);
  }
}
