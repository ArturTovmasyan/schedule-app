import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import {Subscription} from "../../payment/subscriptions/entity/subscription.entity";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', unique: true, nullable: false }) email: string;
  @Column({ type: 'varchar', nullable: false }) firstName: string;
  @Column({ type: 'varchar', nullable: false }) lastName: string;
  @Column({ type: 'varchar', nullable: false }) password: string;
  @Column({ type: 'smallint', nullable: true, default: 0 }) status: number;
  @Column({ type: 'varchar', length: 100, nullable: true, default: 0 }) oauthId: number;
  @Column({ type: 'varchar', length: 10, nullable: true }) provider: string;
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'stripe_customer_id' }) stripeCustomerId: string;
  @OneToOne(() => Subscription, {nullable: true, cascade: true})
  @JoinColumn({ name: "stripe_subscription_id" })
  subscription: Subscription
  @Column({ name: 'stripe_subscription_id', type: 'uuid', nullable: true })
  stripeSubscriptionId: string;

  @CreateDateColumn() createdOn?: Date;
  @UpdateDateColumn() updatedOn?: Date;
  @DeleteDateColumn() deletedOn?: Date;

  @BeforeInsert()
  async _hashPassword?() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
