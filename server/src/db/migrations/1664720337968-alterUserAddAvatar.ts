import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserAddAvatar1664720337968 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
                ADD "avatar" character varying(250) DEFAULT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP "avatar";
        `);
  }
}
