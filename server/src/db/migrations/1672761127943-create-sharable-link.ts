import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSharableLink1672761127943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TYPE meet_via_enum AS ENUM ('${MeetViaEnum.GMeet}', '${MeetViaEnum.Teams}','${MeetViaEnum.Zoom}');
      CREATE TABLE IF NOT EXISTS "sharable_links"
                               ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                                "shared_by" uuid NOT NULL,
                                "title" character varying NOT NULL,
                                "meet_via" meet_via_enum DEFAULT '${MeetViaEnum.Zoom}',
                                "link" character varying(255) NOT NULL,
                                "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                                "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                                "deletedOn" TIMESTAMP,
                                FOREIGN KEY ("shared_by") REFERENCES "user" ("id") ON DELETE CASCADE,
                                PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                DROP TABLE "sharable_links";
                DROP TYPE "meet_via_enum";
                `);
  }
}
