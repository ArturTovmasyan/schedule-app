import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterMeetViaEnum1673631369740 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TYPE meet_via_enum ADD VALUE '${MeetViaEnum.InboundCall}';
          ALTER TYPE meet_via_enum ADD VALUE '${MeetViaEnum.OutboundCall}';
          ALTER TYPE meet_via_enum ADD VALUE '${MeetViaEnum.PhysicalAddress}';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TYPE meet_via_enum DROP VALUE '${MeetViaEnum.InboundCall}';
    ALTER TYPE meet_via_enum DROP VALUE '${MeetViaEnum.OutboundCall}';
    ALTER TYPE meet_via_enum DROP VALUE '${MeetViaEnum.PhysicalAddress}';
                    `);
  }
}
