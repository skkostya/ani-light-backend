import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNewFieldsToEpisode1760078000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавление полей для качества видео
    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'video_url_480',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'video_url_720',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'video_url_1080',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Добавление полей для времени opening и ending
    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'opening',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'ending',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Добавление поля для продолжительности
    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'duration',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление добавленных полей
    await queryRunner.dropColumn('episode', 'duration');
    await queryRunner.dropColumn('episode', 'ending');
    await queryRunner.dropColumn('episode', 'opening');
    await queryRunner.dropColumn('episode', 'video_url_1080');
    await queryRunner.dropColumn('episode', 'video_url_720');
    await queryRunner.dropColumn('episode', 'video_url_480');
  }
}
