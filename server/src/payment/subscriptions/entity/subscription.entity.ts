import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {SubscriptionStatusEnum} from "../enums/subscription-status.enum";

@Entity('subscription')
export class Subscription {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({type: 'varchar', unique: true, nullable: false}) email!: string;
    @Column({type: 'varchar', length: 50, nullable: false}) stripeSubscriptionId!: string;
    @Column({type: 'varchar', length: 50, nullable: false}) stripePlanId!: string;
    @Column({type: 'varchar', length: 10, nullable: true}) endsAt?: Date;
    @Column({type: 'varchar', length: 10, nullable: true}) billingPeriodEndsAt?: Date;
    @Column({type: 'enum', nullable: false, enum: SubscriptionStatusEnum}) status!:SubscriptionStatusEnum
    @Column({type: 'varchar', length: 30, nullable: true}) lastInvoice?: string;

    @CreateDateColumn() createdOn?: Date;
    @UpdateDateColumn() updatedOn?: Date;
    @DeleteDateColumn() deletedOn?: Date;

    activateSubscription(stripeSubscription, periodEnd: Date) {
        this.stripePlanId = stripeSubscription.plan.id;
        this.stripeSubscriptionId = stripeSubscription.id;
        this.status = stripeSubscription.status === 'active' ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.INACTIVE;
        this.lastInvoice = stripeSubscription.latest_invoice;
        this.billingPeriodEndsAt = periodEnd;
        this.endsAt = null;
    }

    deactivateSubscription(): void {
        this.endsAt = this.billingPeriodEndsAt;
        this.billingPeriodEndsAt = null;
    }

    isActive(): boolean {
        return (this.endsAt === null || this.endsAt > new Date()) && this.status === SubscriptionStatusEnum.ACTIVE;
    }

    notActiveYet(): boolean {
        return (this.endsAt === null || this.endsAt > new Date()) && this.status === SubscriptionStatusEnum.INACTIVE;
    }

    isCancelled(): boolean {
        return this.endsAt !== null || this.status === SubscriptionStatusEnum.CANCEL;
    }

    cancel(): void {
        this.endsAt = new Date();
        this.billingPeriodEndsAt = null;
        this.status = SubscriptionStatusEnum.CANCEL;
    }
}
