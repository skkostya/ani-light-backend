import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewFieldsToAnime1760077617414 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавление новых полей в таблицу anime
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'alias',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'is_blocked_by_geo',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'is_ongoing',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'publish_day',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'episodes_total',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'average_duration_of_episode',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'external_created_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление добавленных полей
    await queryRunner.dropColumn('anime', 'external_created_at');
    await queryRunner.dropColumn('anime', 'average_duration_of_episode');
    await queryRunner.dropColumn('anime', 'episodes_total');
    await queryRunner.dropColumn('anime', 'publish_day');
    await queryRunner.dropColumn('anime', 'is_ongoing');
    await queryRunner.dropColumn('anime', 'is_blocked_by_geo');
    await queryRunner.dropColumn('anime', 'alias');
  }
}
