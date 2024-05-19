import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSharableLinkAttendees1672831889045
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          CREATE TABLE IF NOT EXISTS "sharable_link_attendees"
                                   ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                    "link_id" uuid NOT NULL,
                                    "user_id" uuid NOT NULL,
                                    "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                                    "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                                    "deletedOn" TIMESTAMP,
                                    FOREIGN KEY ("link_id") REFERENCES "sharable_links" ("id") ON DELETE CASCADE,
                                    FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                                    UNIQUE("link_id","user_id"),
                                    PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                    DROP TABLE "sharable_link_attendees";
                    `);
  }
}
