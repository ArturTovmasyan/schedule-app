import {MigrationInterface, QueryRunner} from "typeorm";

export class OauthUser1657550836839 implements MigrationInterface {
    name = 'OauthUser1657550836839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "status" smallint DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "oauthId" character varying(100) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "provider" character varying(10)`);
 		await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);

        await queryRunner.query(`UPDATE "user" SET "status" = '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "oauthId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" ADD NOT NULL`);
    }
}
