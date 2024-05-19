import {MigrationInterface, QueryRunner} from 'typeorm';

export class CalendarToken1661010333268 implements MigrationInterface {
    name = 'CalendarToken1661010333268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."calendar_token_calendartype_enum" AS ENUM('GoogleCalendar', 'Office365Calendar', 'ExchangeCalendar', 'OutlookPlugIn', 'iCloudCalendar');`,
        );
        await queryRunner.query(
            `CREATE TABLE "calendar_token"
             (
                 "id"           uuid                                        NOT NULL DEFAULT uuid_generate_v4(),
                 "accessToken"  character varying                           NOT NULL,
                 "refreshToken" character varying,
                 "createdOn"    TIMESTAMP                                   NOT NULL DEFAULT now(),
                 "updatedOn"    TIMESTAMP                                   NOT NULL DEFAULT now(),
                 "expiryDate"   bigint                                      NOT NULL,
                 "calendarType" "public"."calendar_token_calendartype_enum" NOT NULL,
                 "ownerId"      uuid                                        NOT NULL,
                 CONSTRAINT "PK_318edf59ba386f8c574a1063c95" PRIMARY KEY ("id")
             );`,
        );
        await queryRunner.query(
            `ALTER TABLE "calendar_token"
                ADD CONSTRAINT "FK_8d1e7ef930a808687425858faf9"
                    FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE "calendar_token"
                ADD CONSTRAINT "UQ_b1af9cc765014f56a6e2b3cec1d" UNIQUE ("calendarType", "ownerId");
            `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "calendar_token" DROP CONSTRAINT "FK_8d1e7ef930a808687425858faf9"`,
        );
        await queryRunner.query(
            `ALTER TABLE "calendar_token" DROP CONSTRAINT "UQ_b1af9cc765014f56a6e2b3cec1d"`,
        );
        await queryRunner.query(`DROP TABLE "calendar_token"`);
        await queryRunner.query(
            `DROP TYPE "public"."calendar_token_calendartype_enum"`,
        );
    }
}
