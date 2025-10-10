import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateDictionariesTables1760076737134
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание таблицы age_ratings
    await queryRunner.createTable(
      new Table({
        name: 'age_ratings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'value',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'label',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
        ],
      }),
      true,
    );

    // Создание таблицы genres
    await queryRunner.createTable(
      new Table({
        name: 'genres',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'external_id',
            type: 'integer',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'image',
            type: 'jsonb',
          },
        ],
      }),
      true,
    );

    // Создание таблицы anime_genres для связи many-to-many
    await queryRunner.createTable(
      new Table({
        name: 'anime_genres',
        columns: [
          {
            name: 'anime_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'genre_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['anime_id'],
            referencedTableName: 'anime',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['genre_id'],
            referencedTableName: 'genres',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Добавление колонки age_rating_id в таблицу anime
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'age_rating_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Добавление внешнего ключа для age_rating_id
    await queryRunner.createForeignKey(
      'anime',
      new TableForeignKey({
        columnNames: ['age_rating_id'],
        referencedTableName: 'age_ratings',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Создание индексов для оптимизации поиска
    await queryRunner.query(
      'CREATE INDEX "IDX_age_ratings_value" ON "age_ratings" ("value")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_genres_external_id" ON "genres" ("external_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_genres_name" ON "genres" ("name")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_anime_genres_anime_id" ON "anime_genres" ("anime_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_anime_genres_genre_id" ON "anime_genres" ("genre_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление индексов
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_anime_genres_genre_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_anime_genres_anime_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_genres_name"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_genres_external_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_age_ratings_value"');

    // Удаление внешнего ключа age_rating_id
    const animeTable = await queryRunner.getTable('anime');
    if (animeTable) {
      const ageRatingForeignKey = animeTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('age_rating_id') !== -1,
      );
      if (ageRatingForeignKey) {
        await queryRunner.dropForeignKey('anime', ageRatingForeignKey);
      }
    }

    // Удаление колонки age_rating_id
    await queryRunner.dropColumn('anime', 'age_rating_id');

    // Удаление таблиц
    await queryRunner.dropTable('anime_genres');
    await queryRunner.dropTable('genres');
    await queryRunner.dropTable('age_ratings');
  }
}
