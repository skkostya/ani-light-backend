import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAccentColorsToEntities1761892642568
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем колонку accent_colors в таблицу anime
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'accent_colors',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Добавляем колонку accent_colors в таблицу anime_release
    await queryRunner.addColumn(
      'anime_release',
      new TableColumn({
        name: 'accent_colors',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Добавляем колонку accent_colors в таблицу episode
    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'accent_colors',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем колонку accent_colors из таблицы episode
    await queryRunner.dropColumn('episode', 'accent_colors');

    // Удаляем колонку accent_colors из таблицы anime_release
    await queryRunner.dropColumn('anime_release', 'accent_colors');

    // Удаляем колонку accent_colors из таблицы anime
    await queryRunner.dropColumn('anime', 'accent_colors');
  }
}
