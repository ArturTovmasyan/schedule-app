import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCalendarEventAddCreatorsFrom1663272960545
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_event"
                ADD "creatorFromGoogle" character varying;
            ALTER TABLE "calendar_event"
                ADD "creatorFromOutlook" character varying;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "calendar_event" DROP "creatorFromGoogle";
            ALTER TABLE "calendar_event" DROP "creatorFromOutlook";
        `);
  }
}
