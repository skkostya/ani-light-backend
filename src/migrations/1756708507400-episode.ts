import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Episode1756708507400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'episode',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'anime_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'video_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'subtitles_url',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'episode',
      new TableForeignKey({
        columnNames: ['anime_id'],
        referencedTableName: 'anime',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const episodeTable = await queryRunner.getTable('episode');
    const foreignKey = episodeTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('anime_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('episode', foreignKey);
      await queryRunner.dropColumn('episode', 'anime_id');
    }
    await queryRunner.dropTable('episode');
  }
}
