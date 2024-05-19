import { MigrationInterface, QueryRunner } from 'typeorm';

export class createInvitationPendingEmails1669460084611
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "invitation_pending_emails"
                           ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                            "user_id" uuid NOT NULL,
                            "invitation_id" uuid NOT NULL,
                            "emails" jsonb default '[]'::jsonb,
                            "comment" text DEFAULT NULL,
                            "access_request" boolean DEFAULT false,
                            "share_calendar" boolean DEFAULT false,
                            "time_for_access" TIMESTAMP DEFAULT NULL,
                            "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                            "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                            "deletedOn" TIMESTAMP,
                            FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                            FOREIGN KEY ("invitation_id") REFERENCES "invitation" ("id") ON DELETE CASCADE,
                            PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "invitation_pending_emails";
            `);
  }
}
