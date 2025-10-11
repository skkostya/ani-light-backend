import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPreviewImageToEpisode1760164106448
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'episode',
      new TableColumn({
        name: 'preview_image',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('episode', 'preview_image');
  }
}
