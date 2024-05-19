import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserTableColumnOnboarded1685084016006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "user"
          ADD column "onboarded" BOOLEAN NOT NULL DEFAULT FALSE;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "user" 
          DROP column "onboarded";
      `,
    );
  }
}
