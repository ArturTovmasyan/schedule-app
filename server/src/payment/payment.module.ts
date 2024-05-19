import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import {ConfigModule} from "@nestjs/config";
import {PassportModule} from "@nestjs/passport";
import SubscriptionsService from "./subscriptions/subscriptions.service";
import {SubscriptionsController} from "./subscriptions/subscriptions.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "@user/entity/user.entity";
import {Subscription} from "./subscriptions/entity/subscription.entity";

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Subscription]),
  ],
  controllers: [PaymentController, SubscriptionsController],
  providers: [PaymentService, SubscriptionsService]
})
export class PaymentModule {}
