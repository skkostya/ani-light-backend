import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateAnimeTable1760249902803 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу anime
    await queryRunner.createTable(
      new Table({
        name: 'anime',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name_english',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'last_year',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'first_year',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'total_releases',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'total_episodes',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'total_duration',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'total_duration_in_seconds',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Добавляем колонку anime_id в таблицу anime_release
    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'anime_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Создаем внешний ключ для связи anime_release -> anime
    await queryRunner.createForeignKey(
      'anime_release',
      new TableForeignKey({
        columnNames: ['anime_id'],
        referencedTableName: 'anime',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Обновляем внешний ключ в user_anime для связи с anime вместо anime_release
    // Сначала удаляем старый внешний ключ
    const userAnimeTable = await queryRunner.getTable('user_anime');
    if (userAnimeTable) {
      const oldForeignKey = userAnimeTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('anime_id') !== -1,
      );
      if (oldForeignKey) {
        await queryRunner.dropForeignKey('user_anime', oldForeignKey);
      }
    }

    // Создаем новый внешний ключ для связи user_anime -> anime
    await queryRunner.createForeignKey(
      'user_anime',
      new TableForeignKey({
        columnNames: ['anime_id'],
        referencedTableName: 'anime',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Создаем индексы для оптимизации поиска
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_name" ON "anime" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_name_english" ON "anime" ("name_english")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_rating" ON "anime" ("rating")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_first_year" ON "anime" ("first_year")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_last_year" ON "anime" ("last_year")
    `);

    // GIN индекс для полнотекстового поиска по названиям
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_name_gin" 
      ON "anime" USING gin(to_tsvector('russian', "name"))
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_name_english_gin" 
      ON "anime" USING gin(to_tsvector('english', "name_english"))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индексы
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_anime_name_english_gin"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_name_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_last_year"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_first_year"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_rating"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_name_english"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_name"`);

    // Удаляем внешние ключи
    const animeReleaseTable = await queryRunner.getTable('anime_release');
    if (animeReleaseTable) {
      const animeForeignKey = animeReleaseTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('anime_id') !== -1,
      );
      if (animeForeignKey) {
        await queryRunner.dropForeignKey('anime_release', animeForeignKey);
      }
    }

    const userAnimeTable = await queryRunner.getTable('user_anime');
    if (userAnimeTable) {
      const userAnimeForeignKey = userAnimeTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('anime_id') !== -1,
      );
      if (userAnimeForeignKey) {
        await queryRunner.dropForeignKey('user_anime', userAnimeForeignKey);
      }
    }

    // Удаляем колонку anime_id из anime_release
    await queryRunner.dropColumn('anime_release', 'anime_id');

    // Удаляем таблицу anime
    await queryRunner.dropTable('anime');
  }
}
