import {IsString, IsNotEmpty, IsEmail, IsDateString} from 'class-validator';
import {SubscriptionStatusEnum} from "../enums/subscription-status.enum";
import {Expose} from "class-transformer";

export class CreatePaymentSubscriptionDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    stripeSubscriptionId: string;

    @IsString()
    @IsNotEmpty()
    stripePlanId: string;

    @IsDateString()
    @IsNotEmpty()
    endsAt: string;

    @IsDateString()
    @IsNotEmpty()
    billingPeriodEndsAt: string;

    @IsString()
    @IsNotEmpty()
    status: SubscriptionStatusEnum;

    @IsString()
    @IsNotEmpty()
    lastInvoice: string;

    @Expose({ name: 'created_on' })
    createdOn?: Date;

    @Expose({ name: 'updated_on' })
    updatedOn?: Date;

    @Expose({ name: 'deleted_on' })
    deletedOn?: Date;
}
