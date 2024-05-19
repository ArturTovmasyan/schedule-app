import {Controller, Post, Body, UseGuards, Req, HttpCode} from '@nestjs/common';
import { PaymentService } from './payment.service';
import CreateChargeDto from "./dto/create-charge.dto";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "./dto/add-credit-card.dto";

@Controller('api/payment')
@UseGuards(AuthGuard())
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('charge')
  async createCharge(@Body() charge: CreateChargeDto) {
    return await this.paymentService.charge(charge.amount, charge.paymentMethodId);
  }

  @Post('add/credit-cards')
  async addCreditCard(@Body() creditCard: AddCreditCardDto) {
    debugger;
    // const paymentData = await this.paymentService.createPaymentMethod(creditCard.card, creditCard.customerId);
    // return this.paymentService.attachCreditCard(creditCard.paymentMethodId);
    return this.paymentService.setDefaultCreditCard(creditCard.paymentMethodId, creditCard.customerId);
  }

  @Post('card/default')
  @HttpCode(200)
  async setDefaultCard(@Body() creditCard: AddCreditCardDto) {
    debugger;
    await this.paymentService.setDefaultCreditCard(creditCard.paymentMethodId, creditCard.customerId);
  }
}
