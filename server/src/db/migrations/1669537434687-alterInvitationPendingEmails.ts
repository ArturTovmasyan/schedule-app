import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterInvitationPendingEmails1669537434687
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE "invitation_pending_emails"
                    DROP COLUMN "emails";
                    ALTER TABLE "invitation_pending_emails"
                    ADD "email" character varying(250) DEFAULT NULL;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitation_pending_emails" ADD "emails" jsonb default '[]'::jsonb;
      ALTER TABLE "invitation_pending_emails" DROP COLUMN "email";`,
    );
  }
}
