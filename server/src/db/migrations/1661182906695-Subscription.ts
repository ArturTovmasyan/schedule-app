import {MigrationInterface, QueryRunner} from "typeorm";

export class Subscription1661182906695 implements MigrationInterface {
    name = 'Subscription1661182906695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription"
                                 (
                                     "id"                   uuid                  NOT NULL DEFAULT uuid_generate_v4(),
                                     "email"                character varying     NOT NULL,
                                     "stripeSubscriptionId" character varying(50) NOT NULL,
                                     "stripePlanId"         character varying(50) NOT NULL,
                                     "endsAt"               TIMESTAMP,
                                     "billingPeriodEndsAt"  TIMESTAMP,
                                     "status"               smallint              NOT NULL DEFAULT '0',
                                     "lastInvoice"          character varying(30),
                                     "createdOn"            TIMESTAMP             NOT NULL DEFAULT now(),
                                     "updatedOn"            TIMESTAMP             NOT NULL DEFAULT now(),
                                     "deletedOn"            TIMESTAMP,
                                     CONSTRAINT "UQ_ba857f4e5d61b74f184c26de3c4" UNIQUE ("email"),
                                     CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id")
                                 )`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD "stripe_subscription_id" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripe_subscription_id"`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD "stripe_subscription_id" uuid`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD CONSTRAINT "UQ_ed229b1dc042b01cc46516da400" UNIQUE ("stripe_subscription_id")`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD CONSTRAINT "FK_ed229b1dc042b01cc46516da400" FOREIGN KEY ("stripe_subscription_id") REFERENCES "subscription" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ed229b1dc042b01cc46516da400"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_ed229b1dc042b01cc46516da400"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripe_subscription_id"`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD "stripe_subscription_id" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripe_subscription_id"`);
        await queryRunner.query(`DROP TABLE "subscription"`);
    }

}
