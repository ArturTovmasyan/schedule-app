import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCalendarEventAlterRecurrence1668713623811
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_event" RENAME COLUMN "recurrence" TO "recurrenceId";

        `);
    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD CONSTRAINT "FK_8b0a379e273f35db84b2e46e21d" FOREIGN KEY ("recurrenceId") REFERENCES "event_recurrence" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_event"
            DROP
            CONSTRAINT "FK_8b0a379e273f35db84b2e46e21d"`,
    );
    await queryRunner.query(
      `
                ALTER TABLE "calendar_event" RENAME COLUMN "recurrenceId" TO "recurrence";
            `,
    );
  }
}
