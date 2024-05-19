import { InvitationStatusEnum } from 'src/invitation/enums/invitation-status.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class invitation1662478408189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE invitation_status AS ENUM 
            ('${InvitationStatusEnum.Accepted}', '${InvitationStatusEnum.Declined}','${InvitationStatusEnum.Pending}');
                      CREATE TABLE IF NOT EXISTS "invitation"
                       ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                        "user_id" uuid NOT NULL,
                        "status" invitation_status NOT NULL DEFAULT '${InvitationStatusEnum.Pending}',
                        "to_email" varchar NOT NULL,
                        "message" text DEFAULT NULL,
                        "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                        "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                        "deletedOn" TIMESTAMP,
                        FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                        PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "invitation";
        DROP type "invitation_status";
        `);
  }
}
