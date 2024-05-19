import { NotificationTypeEnum } from "src/notifications/enums/notifications.enum";
import {MigrationInterface, QueryRunner} from "typeorm";

export class notifications1663751612349 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          ` CREATE TYPE notification_type AS ENUM ('${NotificationTypeEnum.AccessRequest}', '${NotificationTypeEnum.CalendarAccess}','${NotificationTypeEnum.RequestApproved}','${NotificationTypeEnum.RequestDenied}');  
                CREATE TABLE IF NOT EXISTS "notifications"
                           ("id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                            "sender_id" uuid NOT NULL,
                            "receiver_id" uuid DEFAULT NULL,
                            "type" notification_type NOT NULL,
                            "viewed" boolean DEFAULT false,
                            "access_request_id" uuid DEFAULT NULL,
                            "createdOn" TIMESTAMP NOT NULL DEFAULT now(),
                            "updatedOn" TIMESTAMP NOT NULL DEFAULT now(),
                            "deletedOn" TIMESTAMP,
                            FOREIGN KEY ("sender_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                            FOREIGN KEY ("receiver_id") REFERENCES "user" ("id") ON DELETE CASCADE,
                            FOREIGN KEY ("access_request_id") REFERENCES "access-request" ("id") ON DELETE CASCADE,
                            PRIMARY KEY ("id"))`,
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "notifications";
            DROP type IF EXISTS "notification_type";
            `);
      }

}
