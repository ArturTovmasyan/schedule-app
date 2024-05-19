import {MigrationInterface, QueryRunner} from "typeorm";

export class CalendarEvent1663617112906 implements MigrationInterface {
    name = 'CalendarEvent1663617112906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "calendar_event" DROP COLUMN "creatorFromGoogle"`);
        await queryRunner.query(`ALTER TABLE "calendar_event" DROP COLUMN "creatorFromOutlook"`);
        await queryRunner.query(`ALTER TABLE "calendar_event" ADD "creatorFromGoogle" character varying`);
        await queryRunner.query(`ALTER TABLE "calendar_event" ADD "creatorFromOutlook" character varying`);
        await queryRunner.query(`ALTER TABLE "access-request" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access-request" ALTER COLUMN "status" SET DEFAULT 'pending'-request_status_enum`);
        await queryRunner.query(`ALTER TABLE "calendar_event" DROP COLUMN "creatorFromOutlook"`);
        await queryRunner.query(`ALTER TABLE "calendar_event" DROP COLUMN "creatorFromGoogle"`);
        await queryRunner.query(`ALTER TABLE "calendar_event" ADD "creatorFromOutlook" character varying`);
        await queryRunner.query(`ALTER TABLE "calendar_event" ADD "creatorFromGoogle" character varying`);
    }

}
