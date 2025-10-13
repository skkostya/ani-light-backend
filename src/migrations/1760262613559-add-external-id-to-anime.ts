import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddExternalIdToAnime1760262613559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем колонку external_id
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'external_id',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Создаем уникальный индекс для external_id
    await queryRunner.createIndex(
      'anime',
      new TableIndex({
        name: 'IDX_anime_external_id_unique',
        columnNames: ['external_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем индекс
    await queryRunner.dropIndex('anime', 'IDX_anime_external_id_unique');

    // Удаляем колонку
    await queryRunner.dropColumn('anime', 'external_id');
  }
}
