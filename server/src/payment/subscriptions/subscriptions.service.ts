import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PaymentService} from "../payment.service";
import {InjectRepository} from "@nestjs/typeorm";
import {Subscription} from "./entity/subscription.entity";
import {Repository} from "typeorm";
import {User} from "@user/entity/user.entity";
import {SubscriptionStatusEnum} from "./enums/subscription-status.enum";
import {ErrorMessages} from "../../components/constants/error.messages";

@Injectable()
export default class SubscriptionsService {
    constructor(
        private readonly stripeService: PaymentService,
        private readonly configService: ConfigService,
        @InjectRepository(Subscription)
        private readonly subscriptionRepo: Repository<Subscription>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
    }

    public async createStandardSubscription(stripeCustomerId: string) {
        const priceId = this.configService.get('STANDARD_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(stripeCustomerId);

        if (subscriptions.data.length) {
            throw new BadRequestException('Customer already subscribed');
        }

        return await this.stripeService.createSubscription(priceId, stripeCustomerId);
    }

    public async getStandardSubscription(stripeCustomerId: string) {
        const subscriptions = await this.stripeService.listSubscriptions(stripeCustomerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }

        return subscriptions.data[0];
    }

    public async createProfessionalSubscription(stripeCustomerId: string) {
        const priceId = this.configService.get('PROFESSIONAL_SUBSCRIPTION_PRICE_ID');
        const subscriptions = await this.stripeService.listSubscriptions(stripeCustomerId);

        if (subscriptions.data.length) {
            throw new BadRequestException('Customer already subscribed');
        }

        return await this.stripeService.createSubscription(priceId, stripeCustomerId);
    }

    public async getProfessionalSubscription(stripeCustomerId: string) {
        const subscriptions = await this.stripeService.listSubscriptions(stripeCustomerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }

        return subscriptions.data[0];
    }

    public async saveSubscriptionForUser(subscriptionData, user: User) {
        // @ts-ignore
        const subscription = await this.subscriptionRepo.save({
            // @ts-ignore
            email: user.email,
            stripeSubscriptionId: subscriptionData.id,
            // @ts-ignore
            stripePlanId: subscriptionData.plan.id,
            endsAt: new Date(subscriptionData.ended_at).toISOString(), // TODO fix date string format (1970....)
            billingPeriodEndsAt: new Date(subscriptionData.current_period_end).toISOString(),
            status: subscriptionData.status,
            lastInvoice: subscriptionData.latest_invoice,
        });

        // @ts-ignore
        await this.userRepo.update(user.id, {subscription: subscription.id});
    }

    public async activateSubscription(id, stripeSubscription, periodEnd: Date) {
        await this.subscriptionRepo.update(id, {
            stripePlanId: stripeSubscription.plan.id,
            stripeSubscriptionId: stripeSubscription.id,
            status: stripeSubscription.status === 'active' ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.INACTIVE,
            lastInvoice: stripeSubscription.latest_invoice,
            billingPeriodEndsAt: periodEnd,
            endsAt: null
        });
    }

    public async deactivateSubscription(subscription: Subscription) {
        await this.subscriptionRepo.update(subscription.id, {
            endsAt: subscription.billingPeriodEndsAt,
            billingPeriodEndsAt: null,
        });
    }

    public async isActive(id): Promise<boolean> {
        const subscription = await this.subscriptionRepo.findOne(+id);
        return (new Date(subscription.endsAt) === null || new Date(subscription.endsAt) > new Date()) && subscription.status === SubscriptionStatusEnum.ACTIVE;
    }

    public async notActiveYet(id): Promise<boolean> {
        const subscription = await this.subscriptionRepo.findOne(+id);
        return (subscription.endsAt === null || new Date(new Date(subscription.endsAt)) > new Date()) && subscription.status === SubscriptionStatusEnum.INACTIVE;
    }

    public async isCancelled(id): Promise<boolean> {
        const subscription = await this.subscriptionRepo.findOne(+id);
        return subscription.endsAt !== null || subscription.status === SubscriptionStatusEnum.CANCEL;
    }

    public async cancel(id):Promise<void> {
        //TODO get where subId=id
        await this.subscriptionRepo.update(id, {
            endsAt: new Date(),
            billingPeriodEndsAt: null,
            status: SubscriptionStatusEnum.CANCEL,
        });
    }

    public async fullyCancelSubscription(id):Promise<Subscription[]> {
        return this.subscriptionRepo.remove(id);
    }

    public async reactivateSubscription(user: User) {

        if (!user.subscription) {
            throw new BadRequestException({
                message: ErrorMessages.paymentSubscriptionError,
            });
        }

        const subscription = await this.stripeService.retrieveSubscription(user.subscription.stripeSubscriptionId);
        await this.stripeService.updateSubscription(subscription.id, user.subscription.stripePlanId);
    }
}
