import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterAvailabilityAddTimezone1688083361145
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "calendar_availability"
        ADD column "timezone" character varying NOT NULL DEFAULT 'UTC';
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "calendar_availability" 
        DROP column "timezone";
      `,
    );
  }
}
