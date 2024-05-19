import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddStripeCustomerId1663786332329
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
                ADD "stripe_customer_id" character varying(20);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP "stripe_customer_id";
        `);
  }
}
