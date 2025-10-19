import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddWatchingFieldsToUserAnime1760851287591
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле is_watching
    await queryRunner.addColumn(
      'user_anime',
      new TableColumn({
        name: 'is_watching',
        type: 'boolean',
        default: false,
      }),
    );

    // Добавляем поле last_watched_episode_id
    await queryRunner.addColumn(
      'user_anime',
      new TableColumn({
        name: 'last_watched_episode_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Добавляем поле last_watched_at
    await queryRunner.addColumn(
      'user_anime',
      new TableColumn({
        name: 'last_watched_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Добавляем поле watched_episodes_count
    await queryRunner.addColumn(
      'user_anime',
      new TableColumn({
        name: 'watched_episodes_count',
        type: 'integer',
        default: 0,
      }),
    );

    // Добавляем поле total_episodes_count
    await queryRunner.addColumn(
      'user_anime',
      new TableColumn({
        name: 'total_episodes_count',
        type: 'integer',
        isNullable: true,
      }),
    );

    // Добавляем поле progress_percentage
    await queryRunner.addColumn(
      'user_anime',
      new TableColumn({
        name: 'progress_percentage',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 0,
      }),
    );

    // Добавляем внешний ключ для last_watched_episode_id
    await queryRunner.createForeignKey(
      'user_anime',
      new TableForeignKey({
        columnNames: ['last_watched_episode_id'],
        referencedTableName: 'episode',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешний ключ
    const table = await queryRunner.getTable('user_anime');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('last_watched_episode_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('user_anime', foreignKey);
      }
    }

    // Удаляем все добавленные колонки
    await queryRunner.dropColumn('user_anime', 'progress_percentage');
    await queryRunner.dropColumn('user_anime', 'total_episodes_count');
    await queryRunner.dropColumn('user_anime', 'watched_episodes_count');
    await queryRunner.dropColumn('user_anime', 'last_watched_at');
    await queryRunner.dropColumn('user_anime', 'last_watched_episode_id');
    await queryRunner.dropColumn('user_anime', 'is_watching');
  }
}
