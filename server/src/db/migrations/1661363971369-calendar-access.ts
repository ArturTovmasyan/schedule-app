import { MigrationInterface, QueryRunner } from 'typeorm';

export class calendarAccess1661363971369 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `      CREATE TABLE IF NOT EXISTS "calendar-event-access"
             ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
              "owner_id" uuid NOT NULL,
              "accessed_user_id" uuid DEFAULT NULL,
              "to_email" varchar NOT NULL,
              "time_for_access" TIMESTAMP DEFAULT NULL,
              "comment" TEXT DEFAULT NULL,
              "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
              "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
              "deletedOn" TIMESTAMP,
              FOREIGN KEY ("owner_id") REFERENCES "user" ("id") ON DELETE CASCADE,
              FOREIGN KEY ("accessed_user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
              UNIQUE ("owner_id","to_email"),
              PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TABLE "calendar-access";
    `);
  }
}
