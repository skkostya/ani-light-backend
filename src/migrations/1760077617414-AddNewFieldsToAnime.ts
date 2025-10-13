import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewFieldsToAnimeRelease1760077617414
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавление новых полей в таблицу anime_release_release
    await queryRunner.addColumn(
      'anime_release_release',
      new TableColumn({
        name: 'alias',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'is_blocked_by_geo',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'is_ongoing',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'publish_day',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'episodes_total',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'average_duration_of_episode',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'external_created_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление добавленных полей
    await queryRunner.dropColumn('anime_release', 'external_created_at');
    await queryRunner.dropColumn(
      'anime_release',
      'average_duration_of_episode',
    );
    await queryRunner.dropColumn('anime_release', 'episodes_total');
    await queryRunner.dropColumn('anime_release', 'publish_day');
    await queryRunner.dropColumn('anime_release', 'is_ongoing');
    await queryRunner.dropColumn('anime_release', 'is_blocked_by_geo');
    await queryRunner.dropColumn('anime_release', 'alias');
  }
}
