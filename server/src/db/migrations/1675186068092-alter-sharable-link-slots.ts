import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterSharableLinkSlots1675186068092 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            ALTER TABLE "sharable_link_slots"
            ADD column "meeting_id" varchar(100) DEFAULT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sharable_link_slots" DROP column "meeting_id";`,
    );
  }
}
