import {PartialType} from "@nestjs/mapped-types";
import {CreatePaymentSubscriptionDto} from "./create-payment-subscription.dto";

export class UpdatePaymentSubscriptionDto extends PartialType(CreatePaymentSubscriptionDto) {}
