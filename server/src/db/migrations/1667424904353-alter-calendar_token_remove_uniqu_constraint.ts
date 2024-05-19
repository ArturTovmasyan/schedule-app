import {MigrationInterface, QueryRunner} from "typeorm";

export class alterCalendarTokenRemoveUniquConstraint1667424904353 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "calendar_token"
                DROP CONSTRAINT "UQ_b1af9cc765014f56a6e2b3cec1d";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "calendar_token"
                ADD CONSTRAINT "UQ_b1af9cc765014f56a6e2b3cec1d" UNIQUE("calendarType", "ownerId");
        `);
    }

}
