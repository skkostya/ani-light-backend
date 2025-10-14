import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityRelationships1760443242986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Исправляем связь episode с anime_release
    // Переименовываем колонку anime_id в anime_release_id в таблице episode
    await queryRunner.query(`
            ALTER TABLE "episode" 
            RENAME COLUMN "anime_id" TO "anime_release_id"
        `);

    // Обновляем внешний ключ для episode
    await queryRunner.query(`
            ALTER TABLE "episode" 
            DROP CONSTRAINT IF EXISTS "FK_episode_anime_id"
        `);

    await queryRunner.query(`
            ALTER TABLE "episode" 
            ADD CONSTRAINT "FK_episode_anime_release_id" 
            FOREIGN KEY ("anime_release_id") 
            REFERENCES "anime_release"("id") 
            ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Откатываем изменения
    await queryRunner.query(`
            ALTER TABLE "episode" 
            DROP CONSTRAINT IF EXISTS "FK_episode_anime_release_id"
        `);

    await queryRunner.query(`
            ALTER TABLE "episode" 
            RENAME COLUMN "anime_release_id" TO "anime_id"
        `);

    await queryRunner.query(`
            ALTER TABLE "episode" 
            ADD CONSTRAINT "FK_episode_anime_id" 
            FOREIGN KEY ("anime_id") 
            REFERENCES "anime_release"("id") 
            ON DELETE CASCADE
        `);
  }
}
