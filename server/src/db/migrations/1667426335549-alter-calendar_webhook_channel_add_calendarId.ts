import {MigrationInterface, QueryRunner} from "typeorm";

export class alterCalendarWebhookChannelAddCalendarTokenId1667426335549 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "calendar_webhook_channel"
                ADD "calendarId" uuid NOT NULL
                CONSTRAINT "FK_calendar" REFERENCES calendar (id);
            ALTER TABLE "calendar"
                ADD "calendarTokenId" uuid NOT NULL
                CONSTRAINT "FK_calendar_token" REFERENCES calendar_token (id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "calendar_webhook_channel"
                DROP COLUMN IF EXISTS "calendarId";
            ALTER TABLE "calendar"
                DROP COLUMN IF EXISTS "calendarTokenId";
        `);
    }

}
