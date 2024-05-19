import {MigrationInterface, QueryRunner} from "typeorm";

export class alterSharableLinkSlot1675265686123 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `
                ALTER TABLE "sharable_link_slots"
                ADD column "calendar_event_id" uuid DEFAULT NULL;`,
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          `ALTER TABLE "sharable_link_slots" DROP column "calendar_event_id";`,
        );
      }

}
