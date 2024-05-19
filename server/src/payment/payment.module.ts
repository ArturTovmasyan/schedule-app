import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PassportModule } from '@nestjs/passport';
import SubscriptionsService from './subscriptions/subscriptions.service';
import { SubscriptionsController } from './subscriptions/subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@user/entity/user.entity';
import { Subscription } from './subscriptions/entity/subscription.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, Subscription]),
  ],
  controllers: [PaymentController, SubscriptionsController],
  providers: [PaymentService, SubscriptionsService],
})
export class PaymentModule {}
