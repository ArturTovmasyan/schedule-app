import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterCalendarRefactorColumns1688703344570
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE calendar_event
          DROP COLUMN creator,
          DROP COLUMN "creatorFromOutlook",
          DROP COLUMN "creatorFromGoogle",
          DROP COLUMN "meetLink",
          ADD COLUMN "zoom" jsonb DEFAULT NULL,
          ADD COLUMN "externalId" character varying DEFAULT NULL,
          ADD COLUMN "entanglesLocation" meet_via_enum DEFAULT NULL;
      `,
    );
    await queryRunner.query(
      `
        UPDATE calendar_event 
          SET "externalId" = "googleId" 
          WHERE "googleId" != 'NULL';
      `,
    );
    await queryRunner.query(
      `
        UPDATE calendar_event 
          SET "externalId" = "googleId" 
          WHERE "googleId" != 'NULL';
      `,
    );
    await queryRunner.query(
      `
        ALTER TABLE calendar_event
          DROP COLUMN "googleId",
          DROP COLUMN "outlookId";
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE calendar_event
          ADD COLUMN "creatorFromGoogle" character varying,
          ADD COLUMN "creatorFromOutlook" character varying,
          ADD COLUMN "creator" character varying,
          ADD COLUMN "meetLink" character varying DEFAULT NULL,
          ADD COLUMN "googleId" character varying DEFAULT NULL,
          ADD COLUMN "outlookId" character varying DEFAULT NULL;
      `,
    );
    await queryRunner.query(
      `
        UPDATE calendar_event 
          SET "googleId" = "externalId" 
          WHERE "eventType" = 'GoogleCalendarEvent';
      `,
    );
    await queryRunner.query(
      `
        UPDATE calendar_event 
          SET "outlookId" = "externalId" 
          WHERE "eventType" = 'Office365CalendarEvent';
      `,
    );
    await queryRunner.query(
      `
        ALTER TABLE calendar_event
          DROP COLUMN "zoom",
          DROP COLUMN "externalId",
          DROP COLUMN "entanglesLocation";
      `,
    );
  }
}
