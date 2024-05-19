import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import {ConfigModule} from "@nestjs/config";
import {PassportModule} from "@nestjs/passport";
import SubscriptionsService from "./subscriptions.service";
import {SubscriptionsController} from "./subscriptions/subscriptions.controller";

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [PaymentController, SubscriptionsController],
  providers: [PaymentService, SubscriptionsService]
})
export class PaymentModule {}
