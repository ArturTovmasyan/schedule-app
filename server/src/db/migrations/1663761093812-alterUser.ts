import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUser1663761093812 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
            ADD "stripe_customer_id" character varying DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user" DROP "stripe_customer_id";
    `);
  }
}
