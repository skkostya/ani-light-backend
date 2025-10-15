import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEpisodeAnimeReleaseId1760496131872
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем, есть ли эпизоды с NULL anime_release_id
    const episodesWithNullId = await queryRunner.query(`
            SELECT COUNT(*) as count FROM "episode" 
            WHERE "anime_release_id" IS NULL
        `);

    if (parseInt(episodesWithNullId[0].count) > 0) {
      // Если есть эпизоды без связи, удаляем их (они некорректные)
      await queryRunner.query(`
                DELETE FROM "episode" 
                WHERE "anime_release_id" IS NULL
            `);
    }

    // Удаляем старую колонку anime_id, если она еще существует
    const hasAnimeIdColumn = await queryRunner.hasColumn('episode', 'anime_id');
    if (hasAnimeIdColumn) {
      await queryRunner.query(`
                ALTER TABLE "episode" 
                DROP COLUMN "anime_id"
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Добавляем обратно колонку anime_id
    await queryRunner.query(`
            ALTER TABLE "episode" 
            ADD COLUMN "anime_id" uuid
        `);

    // Копируем данные из anime_release_id в anime_id
    await queryRunner.query(`
            UPDATE "episode" 
            SET "anime_id" = "anime_release_id"
        `);

    // Удаляем anime_release_id
    await queryRunner.query(`
            ALTER TABLE "episode" 
            DROP COLUMN "anime_release_id"
        `);
  }
}
