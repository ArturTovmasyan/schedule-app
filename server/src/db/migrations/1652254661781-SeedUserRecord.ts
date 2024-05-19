import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedUserRecord1652254661781 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('Test@1234', 10);

    const query = `INSERT INTO "user" ("email", "firstName", "lastName", "password") VALUES ('local@test.com', 'Test', 'User', '${password}')`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
