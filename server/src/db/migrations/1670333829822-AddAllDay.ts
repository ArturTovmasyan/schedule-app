import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAllDay1670333829822 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                    ALTER TABLE "calendar_event"
                    ADD COLUMN "allDay" BOOLEAN NOT NULL DEFAULT FALSE;
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "calendar_event" DROP COLUMN "allDay"`);
    }
}
