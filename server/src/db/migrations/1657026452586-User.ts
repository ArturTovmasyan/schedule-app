import {MigrationInterface, QueryRunner} from "typeorm";

export class User1657026452586 implements MigrationInterface {
    name = 'User1657026452586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "status" smallint DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "status" smallint NOT NULL DEFAULT '0'`);
    }

}
