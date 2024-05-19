import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCalendarEventAddCalendarId1667929629463
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD "calendarId" uuid;
        `);

    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD CONSTRAINT "FK_80ab7835e1749581a27462eb87f" FOREIGN KEY ("calendarId") REFERENCES "calendar" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_event"
            DROP
            CONSTRAINT "FK_80ab7835e1749581a27462eb87f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event" DROP COLUMN "calendarId"`,
    );
  }
}
