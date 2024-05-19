import {MigrationInterface, QueryRunner} from "typeorm";

export class alterCalendarEvent1668104632668 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                ALTER TABLE "calendar_event"
                    ADD "recurrence" jsonb default null;
            `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "calendar_event" DROP COLUMN "recurrence"`,
        );
      }

}
