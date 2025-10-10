import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveGenresArrayFromAnime1760076794529
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Удаление колонки genres из таблицы anime
    await queryRunner.dropColumn('anime', 'genres');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Восстановление колонки genres в таблице anime
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'genres',
        type: 'text',
        isArray: true,
        isNullable: true,
      }),
    );
  }
}
