import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {PaymentService} from "./payment.service";

@Injectable()
export default class SubscriptionsService {
    constructor(
        private readonly stripeService: PaymentService,
        private readonly configService: ConfigService
    ) {}

    public async createStandardSubscription(customerId: string) {
        debugger;
        const priceId = this.configService.get('STANDARD_SUBSCRIPTION_PRICE_ID');

        const subscriptions = await this.stripeService.listSubscriptions(priceId, customerId);
        if (subscriptions.data.length) {
            throw new BadRequestException('Customer already subscribed');
        }
        return this.stripeService.createSubscription(priceId, customerId);
    }

    public async getStandardSubscription(customerId: string) {
        const priceId = this.configService.get('STANDARD_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(priceId, customerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }
        return subscriptions.data[0];
    }

    public async createProfessionalSubscription(customerId: string) {
        const priceId = this.configService.get('PROFESSIONAL_SUBSCRIPTION_PRICE_ID');

        const subscriptions = await this.stripeService.listSubscriptions(priceId, customerId);
        if (subscriptions.data.length) {
            throw new BadRequestException('Customer already subscribed');
        }
        return this.stripeService.createSubscription(priceId, customerId);
    }

    public async getProfessionalSubscription(customerId: string) {
        const priceId = this.configService.get('PROFESSIONAL_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(priceId, customerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }
        return subscriptions.data[0];
    }
}
