import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterSharableLinkSlots1672841999011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
              CREATE TABLE IF NOT EXISTS "sharable_link_slots"
                                       ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                        "link_id" uuid NOT NULL,
                                        "choosed_by" uuid DEFAULT NULL,
                                        "start_date" TIMESTAMP NOT NULL,
                                        "end_date" TIMESTAMP NOT NULL,
                                        "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                                        "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                                        "deletedOn" TIMESTAMP,
                                        FOREIGN KEY ("link_id") REFERENCES "sharable_links" ("id") ON DELETE CASCADE,
                                        FOREIGN KEY ("choosed_by") REFERENCES "user" ("id") ON DELETE CASCADE,
                                        UNIQUE("link_id","choosed_by"),
                                        PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                        DROP TABLE "sharable_link_slots";
                        `);
  }
}
