import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddSearchIndexes1756931199128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Индекс для фильтрации по году
    await queryRunner.createIndex(
      'anime',
      new TableIndex({
        name: 'IDX_anime_year',
        columnNames: ['year'],
      }),
    );

    // Индекс для external_id (для связи с AniLibria API)
    await queryRunner.createIndex(
      'anime',
      new TableIndex({
        name: 'IDX_anime_external_id',
        columnNames: ['external_id'],
      }),
    );

    // Составной индекс для сортировки (год + название)
    await queryRunner.createIndex(
      'anime',
      new TableIndex({
        name: 'IDX_anime_year_title',
        columnNames: ['year', 'title_ru'],
      }),
    );

    // Индекс для эпизодов по anime_id и номеру
    await queryRunner.createIndex(
      'episode',
      new TableIndex({
        name: 'IDX_episode_anime_number',
        columnNames: ['anime_id', 'number'],
      }),
    );

    // Специальные PostgreSQL индексы через query (GIN индексы не поддерживаются в TypeORM API)
    // Индекс для поиска по русскому названию (регистронезависимый)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_title_ru_gin" 
      ON "anime" USING gin(to_tsvector('russian', "title_ru"))
    `);

    // Индекс для поиска по английскому названию (регистронезависимый)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_title_en_gin" 
      ON "anime" USING gin(to_tsvector('english', "title_en"))
    `);

    // Индекс для фильтрации по жанрам (GIN для массивов)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_anime_genres_gin" 
      ON "anime" USING gin("genres")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем TypeORM индексы
    await queryRunner.dropIndex('episode', 'IDX_episode_anime_number');
    await queryRunner.dropIndex('anime', 'IDX_anime_year_title');
    await queryRunner.dropIndex('anime', 'IDX_anime_external_id');
    await queryRunner.dropIndex('anime', 'IDX_anime_year');

    // Удаляем специальные PostgreSQL индексы
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_genres_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_title_en_gin"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_anime_title_ru_gin"`);
  }
}
