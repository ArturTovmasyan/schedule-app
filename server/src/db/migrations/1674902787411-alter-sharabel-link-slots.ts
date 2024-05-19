import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterSharabelLinkSlots1674902787411 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "sharable_link_slots"
        ADD column "choosed_by_email" varchar(100) DEFAULT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sharable_link_slots" DROP column "choosed_by_email";`,
    );
  }
}
