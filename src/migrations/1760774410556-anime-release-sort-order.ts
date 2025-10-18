import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AnimeReleaseSortOrder1760774410556 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'sort_order',
        type: 'integer',
        isNullable: false,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('anime_release', 'sort_order');
  }
}
