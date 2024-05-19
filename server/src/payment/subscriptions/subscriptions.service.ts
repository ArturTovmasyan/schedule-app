import {BadRequestException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
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
    ) {}

    public async createSubscription(stripeCustomerId: string, priceId: string) {
        const subscriptions = await this.stripeService.listSubscriptions(stripeCustomerId);

        if (subscriptions.data.length) {
            const sub = subscriptions.data[0];
            const subId = subscriptions.data[0].id;
            const subscription = await this.subscriptionRepo.findOne({where: { stripeSubscriptionId: subId, status: SubscriptionStatusEnum.CANCEL }});

            if (subscription) {
                await this.activateSubscription(subscription.id, sub);
                return subscription;
            }
        }

        return await this.stripeService.createSubscription(priceId, stripeCustomerId);
    }

    public async getSubscription(stripeCustomerId: string) {
        const subscriptions = await this.stripeService.listSubscriptions(stripeCustomerId);

        if (!subscriptions.data.length) {
            return new NotFoundException('Customer not subscribed');
        }

        return subscriptions.data[0];
    }

    public async saveSubscriptionForUser(subscriptionData, user: User) {
        // @ts-ignore
        const subscription = await this.subscriptionRepo.upsert({
            // @ts-ignore
            email: user.email,
            endsAt: null,
            stripeSubscriptionId: subscriptionData.id,
            // @ts-ignore
            stripePlanId: subscriptionData.plan.id,
            endsAt: new Date(subscriptionData.ended_at).toISOString(), // TODO fix date string format (1970....)
            billingPeriodEndsAt: new Date(subscriptionData.current_period_end).toISOString(),
            status: subscriptionData.status,
            lastInvoice: subscriptionData.latest_invoice,
        }, {
                conflictPaths: ['email'],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        // @ts-ignore
        await this.userRepo.update(user.id, {stripeSubscriptionId: subscription.raw[0].id});
    }

    public async activateSubscription(id, stripeSubscription) {
        await this.subscriptionRepo.update(id, {
            stripePlanId: stripeSubscription.plan.id,
            stripeSubscriptionId: stripeSubscription.id,
            status: stripeSubscription.status === SubscriptionStatusEnum.ACTIVE ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.INACTIVE,
            lastInvoice: stripeSubscription.latest_invoice,
            billingPeriodEndsAt: new Date(stripeSubscription.current_period_end * 1000),
            endsAt: null
        });
    }

    public async isActive(id): Promise<boolean> {
        const subscription = await this.subscriptionRepo.findOne(+id);
        return (new Date(subscription.endsAt) === null || new Date(subscription.endsAt) > new Date()) && subscription.status === SubscriptionStatusEnum.ACTIVE;
    }

    public async notActiveYet(id): Promise<boolean> {
<<<<<<< HEAD
        const subscription = await this.subscriptionRepo.findOne(+id);
        return (subscription.endsAt === null || new Date(new Date(subscription.endsAt)) > new Date()) && subscription.status === SubscriptionStatusEnum.INACTIVE;
=======
        const subscription = await this.subscriptionRepo.findOne({where: { id: id }});
        return (subscription.endsAt === null || new Date(subscription.endsAt) > new Date()) && subscription.status === SubscriptionStatusEnum.INACTIVE;
>>>>>>> 2cd4f4b (Finish payment integration)
    }

    public async isCancelled(id): Promise<boolean> {
        const subscription = await this.subscriptionRepo.findOne(+id);
        return subscription.endsAt !== null || subscription.status === SubscriptionStatusEnum.CANCEL;
    }

    public async cancel(stripeSubscriptionId): Promise<NotFoundException> {
        const subscription = await this.subscriptionRepo.findOne({where: { stripeSubscriptionId: stripeSubscriptionId }});

        if (!subscription) {
            return new NotFoundException('Subscription not found');
        }

        await this.subscriptionRepo.update(subscription.id, {
            endsAt: new Date(),
            billingPeriodEndsAt: null,
            status: SubscriptionStatusEnum.CANCEL,
        });
    }

    public async fullyCancelSubscription(id): Promise<Subscription[]> {
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
