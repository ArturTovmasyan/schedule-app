import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateSubscriptionStatusAndDates1664392371390 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "subscription" ALTER COLUMN "status" TYPE character varying(15)`);

        await queryRunner.query(
            `ALTER TABLE subscription
            ALTER COLUMN "billingPeriodEndsAt" TYPE TIMESTAMP without time zone,
            ALTER COLUMN "endsAt" TYPE TIMESTAMP without time zone;`
        )
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE subscription
            ALTER COLUMN "billingPeriodEndsAt" TYPE TIMESTAMP without time zone USING "billingPeriodEndsAt"::TIMESTAMP without time zone,
            ALTER COLUMN "endsAt" TYPE TIMESTAMP without time zone USING "endsAt"::TIMESTAMP without time zone;`
        )
    }
}
