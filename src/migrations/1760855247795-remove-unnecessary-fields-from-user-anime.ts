import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnnecessaryFieldsFromUserAnime1760855247795
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Удаляем ненужные поля
    await queryRunner.dropColumn('user_anime', 'watched_episodes_count');
    await queryRunner.dropColumn('user_anime', 'total_episodes_count');
    await queryRunner.dropColumn('user_anime', 'progress_percentage');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Восстанавливаем поля (если понадобится откат)
    await queryRunner.query(`
      ALTER TABLE "user_anime" 
      ADD COLUMN "watched_episodes_count" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "user_anime" 
      ADD COLUMN "total_episodes_count" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "user_anime" 
      ADD COLUMN "progress_percentage" decimal(5,2) NOT NULL DEFAULT 0
    `);
  }
}
