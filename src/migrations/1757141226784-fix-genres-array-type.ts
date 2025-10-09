import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixGenresArrayType1757141226784 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Удаляем старое поле genres
    await queryRunner.dropColumn('anime', 'genres');

    // Добавляем новое поле genres как text array
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'genres',
        type: 'text',
        isArray: true,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем новое поле genres
    await queryRunner.dropColumn('anime', 'genres');

    // Возвращаем старое поле genres как character varying array
    await queryRunner.addColumn(
      'anime',
      new TableColumn({
        name: 'genres',
        type: 'character varying',
        isArray: true,
        isNullable: false,
      }),
    );
  }
}
