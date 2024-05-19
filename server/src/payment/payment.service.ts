import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import Stripe from 'stripe';
import StripeError from "./enums/stripe.error.enum";

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: "2020-08-27",
    });
  }

  public async createCustomer(name: string, email: string) {
    debugger;
    return this.stripe.customers.create({
      name,
      email
    });
  }

  public async charge(amount: number, paymentMethodId: string) {
    debugger;
    return this.stripe.paymentIntents.create({
      amount,
      payment_method_types: ['card'],
      currency: this.configService.get('STRIPE_CURRENCY'),
      off_session: true,
      confirm: true,
      payment_method_data: {
        card: {
          token: paymentMethodId
        },
        // @ts-ignore
        type: 'card'
      }
    })
  }

  public async attachCreditCard(paymentMethodId: string) {
    debugger;
    // @ts-ignore
    return this.stripe.setupIntents.create({
      payment_method_data: {
        card: {
          token: paymentMethodId
        },
        // @ts-ignore
        type: 'card'
      }
    })
  }

  public async setDefaultCreditCard(paymentMethodId: string, customerId: string) {
    try {
      debugger;
      return await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      })
    } catch (error) {
      if (error?.type === StripeError.InvalidRequest) {
        throw new BadRequestException('Wrong credit card chosen');
      }
      throw new InternalServerErrorException();
    }
  }

  public async createSubscription(priceId: string, customerId: string,) {
    try {
      return await this.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId
          }
        ]
      })
    } catch (error) {
      if (error?.code === StripeError.ResourceMissing) {
        throw new BadRequestException('Credit card not set up');
      }
      throw new InternalServerErrorException();
    }
  }

  public async listSubscriptions(priceId: string, customerId: string,) {
    return this.stripe.subscriptions.list({
      customer: customerId,
      price: priceId
    })
  }
}
