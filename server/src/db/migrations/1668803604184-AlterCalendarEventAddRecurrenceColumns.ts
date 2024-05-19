import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCalendarEventAddRecurrenceColumns1668803604184
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_event" DROP COLUMN "recurrence"`,
    );
    await queryRunner.query(`
            CREATE TYPE "public"."calendar_event_recurrencetype_enum" AS ENUM('daily', 'weekly', 'absoluteMonthly', 'relativeMonthly', 'absoluteYearly', 'relativeYearly');
            CREATE TYPE "public"."calendar_event_recurrencedaysofweek_enum" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
            CREATE TYPE "public"."calendar_event_recurrenceindexofweek_enum" AS ENUM('first', 'second', 'third', 'fourth', 'last');
        `);
    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD "recurrenceType" "public"."calendar_event_recurrencetype_enum";
            ALTER TABLE "calendar_event"
                ADD "recurrenceInterval" integer;
            ALTER TABLE "calendar_event"
                ADD "recurrenceDaysOfWeek" "public"."calendar_event_recurrencedaysofweek_enum" array;
            ALTER TABLE "calendar_event"
                ADD "recurrenceIndexOfWeek" "public"."calendar_event_recurrenceindexofweek_enum";
            ALTER TABLE "calendar_event"
                ADD "recurrenceDayOfMonth" integer;
            ALTER TABLE "calendar_event"
                ADD "recurrenceMonth" integer;
            ALTER TABLE "calendar_event"
                ADD "recurrenceFirstDayOfWeek" character varying;
            ALTER TABLE "calendar_event"
                ADD "recurrenceStartDate" TIMESTAMP DEFAULT null;
            ALTER TABLE "calendar_event"
                ADD "recurrenceEndDate" TIMESTAMP DEFAULT null;
            ALTER TABLE "calendar_event"
                ADD "recurrenceNumberOfOccurrences" integer;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceNumberOfOccurrences";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceEndDate";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceStartDate";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceFirstDayOfWeek";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceMonth";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceDayOfMonth";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceIndexOfWeek";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceDaysOfWeek";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceInterval";
            ALTER TABLE "calendar_event" DROP COLUMN "recurrenceType";
        `);
    await queryRunner.query(`
      DROP TYPE "public"."calendar_event_recurrencetype_enum";
      DROP TYPE "public"."calendar_event_recurrencedaysofweek_enum";
      DROP TYPE "public"."calendar_event_recurrenceindexofweek_enum";
      `);

    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD "recurrence" jsonb default null;
        `);
  }
}
