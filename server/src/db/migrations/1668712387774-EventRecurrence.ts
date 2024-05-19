import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventRecurrence1668712387774 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           CREATE TYPE "public"."event_recurrence_type_enum" AS ENUM('daily', 'weekly', 'absoluteMonthly', 'relativeMonthly', 'absoluteYearly', 'relativeYearly');
           CREATE TYPE "public"."event_recurrence_daysofweek_enum" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
           CREATE TYPE "public"."event_recurrence_indexofweek_enum" AS ENUM('first', 'second', 'third', 'fourth', 'last');
        `);
    await queryRunner.query(`
            CREATE TABLE "event_recurrence"
            (
                "id"                  uuid                                  NOT NULL DEFAULT uuid_generate_v4(),
                "type"                "public"."event_recurrence_type_enum" NOT NULL,
                "interval"            integer,
                "daysOfWeek"          "public"."event_recurrence_daysofweek_enum" array,
                "indexOfWeek"         "public"."event_recurrence_indexofweek_enum",
                "dayOfMonth"          integer,
                "month"               integer,
                "firstDayOfWeek"      character varying,
                "startDate"           TIMESTAMP                                      DEFAULT now(),
                "endDate"             TIMESTAMP                                      DEFAULT now(),
                "numberOfOccurrences" integer,
                CONSTRAINT "PK_ded244e34e7d646ca33f75848ea" PRIMARY KEY ("id")
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event_recurrence"`);

    await queryRunner.query(
      `
              DROP TYPE "public"."event_recurrence_type_enum";
              DROP TYPE "public"."event_recurrence_daysofweek_enum";
              DROP TYPE "public"."event_recurrence_indexofweek_enum";          
          `,
    );
  }
}
