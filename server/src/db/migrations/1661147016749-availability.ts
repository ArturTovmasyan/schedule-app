import { ClockType } from 'src/availability/enums/clockType.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class availability1661147016749 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE clock_type_enum AS ENUM ('${ClockType.H12}', '${ClockType.H24}','${ClockType.Both}');
      CREATE TABLE IF NOT EXISTS "availability"
       ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "from" TIMESTAMP  NOT NULL,
        "to" TIMESTAMP NOT NULL,
        "sunday" boolean DEFAULT false NOT NULL,
        "monday" boolean DEFAULT false NOT NULL,
        "tuesday" boolean DEFAULT false NOT NULL,
        "wednesday" boolean DEFAULT false NOT NULL,
        "thursday" boolean DEFAULT false NOT NULL,
        "friday" boolean DEFAULT false NOT NULL,
        "saturday" boolean DEFAULT false NOT NULL,
        "clock_type" clock_type_enum NOT NULL,
        "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedOn" TIMESTAMP,
        FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
        UNIQUE ("user_id"),
        PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TABLE "availability";
    DROP type "clock_type_enum";
    `);
  }
}
