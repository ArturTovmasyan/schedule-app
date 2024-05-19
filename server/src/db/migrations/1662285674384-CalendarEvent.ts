import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarEvent1662285674384 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."calendar_event_calendartype_enum" AS 
            ENUM('GoogleCalendar', 'Office365Calendar', 'ExchangeCalendar', 'OutlookPlugIn', 'iCloudCalendar');
        `);
    await queryRunner.query(`
            CREATE TABLE "calendar_event"
            (
                "id"           uuid                                        NOT NULL DEFAULT uuid_generate_v4(),
                "eventId"      character varying                           NOT NULL,
                "creator"      character varying,
                "title"        character varying,
                "description"  character varying,
                "meetLink"     character varying,
                "start"        TIMESTAMP(3)                                         DEFAULT now(),
                "end"          TIMESTAMP(3)                                         DEFAULT now(),
                "createdOn"    TIMESTAMP                                   NOT NULL DEFAULT now(),
                "updatedOn"    TIMESTAMP                                   NOT NULL DEFAULT now(),
                "calendarType" "public"."calendar_event_calendartype_enum" NOT NULL,
                "ownerId"      uuid                                        NOT NULL,
                CONSTRAINT "PK_176fe24e6eb48c3fef696c7641f" PRIMARY KEY ("id")
            );


        `);
    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD CONSTRAINT "FK_a7ac80d698e18c0d5989d5d2847"
                    FOREIGN KEY ("ownerId") REFERENCES "user" ("id")
                        ON DELETE NO ACTION ON UPDATE NO ACTION;

        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_event"
            DROP
            CONSTRAINT "FK_a7ac80d698e18c0d5989d5d2847"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_event"`);

    await queryRunner.query(
      `DROP TYPE "public"."calendar_event_calendartype_enum"`,
    );
  }
}
