import {MigrationInterface, QueryRunner} from "typeorm";

export class OauthUser1657550836839 implements MigrationInterface {
    name = 'OauthUser1657550836839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "status" IF NOT EXISTS smallint DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "oauthId" IF NOT EXISTS  character varying(100) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "provider" IF NOT EXISTS  character varying(10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "oauthId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    }
}
