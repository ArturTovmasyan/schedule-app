import { AccessibilityTypeEnum } from 'src/calendar-accessibility/enums/calendar-accessibility.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class calendarAccessibility1661876358995 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE accessibility_type_enum AS ENUM 
      ('${AccessibilityTypeEnum.Domain}', '${AccessibilityTypeEnum.Public}','${AccessibilityTypeEnum.Request}');
                CREATE TABLE IF NOT EXISTS "calendar_accessibility"
                 ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                  "user_id" uuid NOT NULL,
                  "accessibility_type" accessibility_type_enum NOT NULL,
                  domains jsonb default '[]'::jsonb,
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
        DROP TABLE "calendar_accessibility";
        DROP type "accessibility_type_enum";
        `);
  }
}
