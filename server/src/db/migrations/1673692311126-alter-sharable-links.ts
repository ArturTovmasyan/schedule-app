import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterSharableLinks1673692311126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "sharable_links" ADD COLUMN
        "phone_number" character varying DEFAULT NULL,
        ADD COLUMN
        "address" character varying(100) DEFAULT NULL;
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                   ALTER TABLE "sharable_links" DROP COLUMN "phone_number","address";
                    `);
  }
}
