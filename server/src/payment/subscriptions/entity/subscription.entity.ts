import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('subscription')
export class Subscription {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({type: 'varchar', unique: true, nullable: false}) email!: string;
    @Column({type: 'varchar', length: 50, nullable: false}) stripeSubscriptionId!: string;
    @Column({type: 'varchar', length: 50, nullable: false}) stripePlanId!: string;
    @Column({type: 'timestamp without time zone', nullable: true}) endsAt?: Date;
    @Column({type: 'timestamp without time zone', nullable: true}) billingPeriodEndsAt?: Date;
    @Column({type: 'varchar', length: 15, nullable: false}) status!:string
    @Column({type: 'varchar', length: 30, nullable: true}) lastInvoice?: string;
    @CreateDateColumn() createdOn?: Date;
    @UpdateDateColumn() updatedOn?: Date;
    @DeleteDateColumn() deletedOn?: Date;
}
