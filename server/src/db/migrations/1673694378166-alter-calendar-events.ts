import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterCalendarEvents1673694378166 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            ALTER TABLE "calendar_event" ADD COLUMN
            "phone_number" character varying DEFAULT NULL,
            ADD COLUMN
            "address" character varying(100) DEFAULT NULL;
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                       ALTER TABLE "calendar_event" DROP COLUMN "phone_number","address";
                        `);
  }
}
