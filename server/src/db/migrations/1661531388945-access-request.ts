import { RequestStatusEnum } from 'src/access-request/enums/requestStatus.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class accessRequest1661531388945 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` CREATE TYPE request_status AS ENUM ('${RequestStatusEnum.Accepted}', '${RequestStatusEnum.Declined}','${RequestStatusEnum.Pending}');  
        CREATE TABLE IF NOT EXISTS "access-request"
                   ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "applicant_id" uuid NOT NULL,
                    "receiver_id" uuid DEFAULT NULL,
                    "to_email" varchar NOT NULL,
                    "time_for_access" TIMESTAMP DEFAULT NULL,
                    "comment" TEXT DEFAULT NULL,
                    "status" request_status DEFAULT '${RequestStatusEnum.Pending}',
                    "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                    "deletedOn" TIMESTAMP,
                    FOREIGN KEY ("applicant_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                    FOREIGN KEY ("receiver_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                    PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DROP TABLE "access-request";
    DROP type IF EXISTS "request_status";
    `);
  }
}
