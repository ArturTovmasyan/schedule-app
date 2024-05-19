import {Controller, Post, Body, UseGuards, Req, HttpCode} from '@nestjs/common';
import { PaymentService } from './payment.service';
import CreateChargeDto from "./dto/create-charge.dto";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "./dto/add-credit-card.dto";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import StripeWebhook from "./enums/stripe.webhook.enum";
import SubscriptionsService from "./subscriptions/subscriptions.service";

@ApiBearerAuth()
@ApiTags('Payment')
@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService, private readonly subscriptionService: SubscriptionsService) {}

  @Post('charge')
  @UseGuards(AuthGuard())
  async createCharge(@Body() charge: CreateChargeDto) {
    return await this.paymentService.charge(charge.amount, charge.paymentMethodId);
  }

  @Post('stripe')
  async stripeWebHook(@Req() req) {
    const event = req.body;
    const data = event.data.object;

    switch (event.type) {
      case StripeWebhook.PAYMENT_FAILED:
        // await this.subscriptionService.cancel(data.id);
        break;
      case StripeWebhook.SUBSCRIPTION_DELETE:
        await this.subscriptionService.cancel(data.id);
        // await this.subscriptionService.fullyCancelSubscription(data.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  @Post('add/credit-cards')
  @UseGuards(AuthGuard())
  async addCreditCard(@Body() creditCard: AddCreditCardDto) {
    return this.paymentService.setDefaultCreditCard(creditCard.stripeToken, creditCard.customerId);
  }

  @Post('card/default')
  @UseGuards(AuthGuard())
  async setDefaultCard(@Body() creditCard: AddCreditCardDto) {
    await this.paymentService.setDefaultCreditCard(creditCard.stripeToken, creditCard.customerId);
  }
}
