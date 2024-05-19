import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCalendarToken1664097724617 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_token"
                ADD "owner_email" character varying(100) DEFAULT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_token" DROP "owner_email";
        `);
  }
}
