import {MigrationInterface, QueryRunner} from 'typeorm';

export class CalendarPermissions1661010333268 implements MigrationInterface {
    name = 'CalendarPermissions1661010333268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."calendar_permission_calendartype_enum" AS ENUM('GoogleCalendar', 'Office365Calendar', 'ExchangeCalendar', 'OutlookPlugIn', 'iCloudCalendar');`,
        );
        await queryRunner.query(
            `CREATE TABLE "calendar_permission"
             (
                 "id"           SERIAL                                           NOT NULL,
                 "accessToken"  character varying                                NOT NULL,
                 "refreshToken" character varying                                NOT NULL,
                 "createdAt"    TIMESTAMP                                        NOT NULL DEFAULT now(),
                 "updatedAt"    TIMESTAMP                                        NOT NULL DEFAULT now(),
                 "expiryDate"   TIMESTAMP(3)                                     NOT NULL DEFAULT now(),
                 "calendarType" "public"."calendar_permission_calendartype_enum" NOT NULL,
                 "ownerId"      uuid                                             NOT NULL,
                 CONSTRAINT "PK_318edf59ba386f8c574a1063c95" PRIMARY KEY ("id")
             );`,
        );
        await queryRunner.query(
            `ALTER TABLE "calendar_permission"
                ADD CONSTRAINT "FK_01b8fe259eaf727ac76211efc57" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "calendar_permission" DROP CONSTRAINT "FK_01b8fe259eaf727ac76211efc57"`,
        );
        await queryRunner.query(`DROP TABLE "calendar_permission"`);
        await queryRunner.query(
            `DROP TYPE "public"."calendar_permission_calendartype_enum"`,
        );
    }
}
