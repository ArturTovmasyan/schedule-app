import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PaymentService} from "./payment.service";

@Injectable()
export default class SubscriptionsService {
    constructor(
        private readonly stripeService: PaymentService,
        private readonly configService: ConfigService
    ) {}

    public async createStandardSubscription(stripeCustomerId: string, paymentMethodId: string) {
        debugger;
        const priceId = this.configService.get('STANDARD_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(priceId, stripeCustomerId);

        if (subscriptions.data.length) {
            throw new BadRequestException('Customer already subscribed');
        }
        return await this.stripeService.createSubscription(priceId, stripeCustomerId, paymentMethodId);
    }

    public async getStandardSubscription(stripeCustomerId: string) {
        const priceId = this.configService.get('STANDARD_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(priceId, stripeCustomerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }
        return subscriptions.data[0];
    }

    public async createProfessionalSubscription(stripeCustomerId: string, paymentMethodId: string) {
        const priceId = this.configService.get('PROFESSIONAL_SUBSCRIPTION_PRICE_ID');

        debugger;
        const subscriptions = await this.stripeService.listSubscriptions(priceId, stripeCustomerId);
        if (subscriptions.data.length) {
            throw new BadRequestException('Customer already subscribed');
        }
         const subData = await this.stripeService.createSubscription(priceId, stripeCustomerId, paymentMethodId);

        if (subData) {
            //TODO create subscription
        }

        return subData;
    }

    public async getProfessionalSubscription(stripeCustomerId: string) {
        const priceId = this.configService.get('PROFESSIONAL_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(priceId, stripeCustomerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }
        return subscriptions.data[0];
    }
}
