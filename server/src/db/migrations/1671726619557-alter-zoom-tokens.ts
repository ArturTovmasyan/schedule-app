import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterZoomTokens1671726619557 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "zoom_oauth_token"
      ADD CONSTRAINT U_4564568454245 UNIQUE ("userId");
        `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "zoom_oauth_token"
      DROP CONSTRAINT U_4564568454245 UNIQUE ("userId");
      `,
    );
  }
}
