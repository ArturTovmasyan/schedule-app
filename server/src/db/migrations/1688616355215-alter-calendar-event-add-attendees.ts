import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterCalendarEventAddAttendees1688616355215
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "calendar_event" ADD COLUMN "attendees" jsonb default '[]'::jsonb;
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        ALTER TABLE "calendar_event" DROP column "attendees";
      `,
    );
  }
}
