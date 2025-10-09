import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Anime1756708079438 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
            name: 'external_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'title_ru',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'title_en',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'genres',
            type: 'varchar',
            isArray: true,
            isNullable: false,
          },
          {
            name: 'year',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'poster_url',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('anime');
  }
}
