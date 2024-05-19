import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterSharableLinksSlots1675505253479
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
                ALTER TABLE "sharable_link_slots"
                ADD column "metadata" jsonb DEFAULT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sharable_link_slots" DROP column "metadata";`,
    );
  }
}
