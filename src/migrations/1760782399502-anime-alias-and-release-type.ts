import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AnimeAliasAndReleaseType1760782399502
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'alias',
        type: 'varchar',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['TV', 'ONA', 'WEB', 'OVA', 'OAD', 'MOVIE', 'DORAMA', 'SPECIAL'],
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('anime', 'alias');
    await queryRunner.dropColumn('anime_release', 'type');
  }
}
