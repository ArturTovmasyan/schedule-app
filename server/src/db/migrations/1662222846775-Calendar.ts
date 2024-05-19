import { MigrationInterface, QueryRunner } from 'typeorm';

export class Calendar1662222846775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."calendar_calendartype_enum" AS 
            ENUM('GoogleCalendar', 'Office365Calendar', 'ExchangeCalendar', 'OutlookPlugIn', 'iCloudCalendar');
        `);
    await queryRunner.query(`
            CREATE TABLE "calendar"
            (
                "id"           uuid                                  NOT NULL DEFAULT uuid_generate_v4(),
                "calendarId"   character varying                     NOT NULL,
                "isPrimary"    boolean                               NOT NULL,
                "calendarType" "public"."calendar_calendartype_enum" NOT NULL,
                "createdOn"    TIMESTAMP                             NOT NULL DEFAULT now(),
                "updatedOn"    TIMESTAMP                             NOT NULL DEFAULT now(),
                "ownerId"      uuid                                  NOT NULL,
                CONSTRAINT "PK_2492fb846a48ea16d53864e3267" PRIMARY KEY ("id")
            );

        `);
    await queryRunner.query(`
            ALTER TABLE "calendar"
                ADD CONSTRAINT "FK_88475c81373fcbc15e787ca9555"
                    FOREIGN KEY ("ownerId") REFERENCES "user" ("id")
                        ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar"
                DROP CONSTRAINT "FK_88475c81373fcbc15e787ca9555"`,
    );
    await queryRunner.query(`DROP TABLE "calendar"`);

    await queryRunner.query(
      `DROP TYPE "public"."calendar_token_calendartype_enum"`,
    );
  }
}
