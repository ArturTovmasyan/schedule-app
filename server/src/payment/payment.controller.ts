import {Controller, Post, Body, UseGuards, Req, HttpCode} from '@nestjs/common';
import { PaymentService } from './payment.service';
import CreateChargeDto from "./dto/create-charge.dto";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "./dto/add-credit-card.dto";

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('charge')
  @UseGuards(AuthGuard())
  async createCharge(@Body() charge: CreateChargeDto) {
    return await this.paymentService.charge(charge.amount, charge.paymentMethodId);
  }

  @Post('add/credit-cards')
  @UseGuards(AuthGuard())
  async addCreditCard(@Body() creditCard: AddCreditCardDto) {
    debugger;
    return this.paymentService.attachCreditCard(creditCard.paymentMethodId);
  }

  @Post('card/default')
  @HttpCode(200)
  @UseGuards(AuthGuard())
  async setDefaultCard(@Body() creditCard: AddCreditCardDto) {
    await this.paymentService.setDefaultCreditCard(creditCard.paymentMethodId, creditCard.customerId);
  }
}
