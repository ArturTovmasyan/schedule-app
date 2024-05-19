import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalendarWebhookChannel1662894656516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."calendar_webhook_channel_calendartype_enum" 
            AS ENUM('GoogleCalendar', 'Office365Calendar', 'ExchangeCalendar', 'OutlookPlugIn', 'iCloudCalendar');
        `);
    await queryRunner.query(`
            CREATE TABLE "calendar_webhook_channel"
            (
                "id"             uuid                                                  NOT NULL DEFAULT uuid_generate_v4(),
                "channelId"      character varying,
                "expirationDate" TIMESTAMP(3)                                                   DEFAULT now(),
                "createdOn"      TIMESTAMP                                             NOT NULL DEFAULT now(),
                "updatedOn"      TIMESTAMP                                             NOT NULL DEFAULT now(),
                "calendarType"   "public"."calendar_webhook_channel_calendartype_enum" NOT NULL,
                "ownerId"        uuid                                                  NOT NULL,
                CONSTRAINT "PK_ba83bff5588faa21d633f6c2ec4" PRIMARY KEY ("id")
            );

        `);
    await queryRunner.query(`
            ALTER TABLE "calendar_webhook_channel"
                ADD CONSTRAINT "FK_d5cc5eb73077b2b4f1402f6d792"
                    FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_webhook_channel"
            DROP
            CONSTRAINT "FK_d5cc5eb73077b2b4f1402f6d792"`,
    );
    await queryRunner.query(`DROP TABLE "calendar_webhook_channel"`);

    await queryRunner.query(
      `DROP TYPE "public"."calendar_webhook_channel_calendartype_enum"`,
    );
  }
}
