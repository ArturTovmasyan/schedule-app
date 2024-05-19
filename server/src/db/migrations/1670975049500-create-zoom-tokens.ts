import { MigrationInterface, QueryRunner } from 'typeorm';

export class createZoomTokens1670975049500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "zoom_oauth_token"
                            ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                            "accessToken" character varying COLLATE pg_catalog."default" NOT NULL,
                            "refreshToken" character varying COLLATE pg_catalog."default",
                            "createdOn" timestamp NOT NULL DEFAULT now(),
                            "updatedOn" timestamp NOT NULL DEFAULT now(),
                            "expiryDate" timestamp(3) without time zone NOT NULL DEFAULT now(),
                            "userId" uuid NOT NULL,
                            CONSTRAINT "PK_47edbe75aaf6fb4cdfdb03bdxe1" PRIMARY KEY (id),
                            CONSTRAINT "FK_8d1e7ef930a808687425358fsf9" FOREIGN KEY ("userId")
                                REFERENCES public."user" (id) MATCH SIMPLE
                                ON UPDATE NO ACTION
                                ON DELETE CASCADE)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE "zoom_oauth_token";
    `);
  }
}
