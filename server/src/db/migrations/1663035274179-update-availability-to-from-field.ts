import {MigrationInterface, QueryRunner} from "typeorm";

export class updateAvailabilityToFromField1663035274179 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE calendar_availability
            ALTER COLUMN "from" TYPE character varying(7),
            ALTER COLUMN "to" TYPE character varying(7);`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE calendar_availability
            ALTER COLUMN "from" TYPE TIMESTAMP without time zone USING "from"::timestamp without time zone,
            ALTER COLUMN "to" TYPE TIMESTAMP without time zone USING "to"::timestamp without time zone;`
        )
    }

}
