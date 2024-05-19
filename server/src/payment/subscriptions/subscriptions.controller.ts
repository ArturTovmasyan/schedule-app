import {BadRequestException, Body, Controller, Get, HttpStatus, Post, UseGuards} from '@nestjs/common';
import SubscriptionsService from "./subscriptions.service";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "../dto/add-credit-card.dto";
import {GetUser} from "../../components/decorators/get-user.decorator";
import {User} from "@user/entity/user.entity";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {PaymentService} from "../payment.service";

@ApiBearerAuth()
@ApiTags('Payment Subscription')
@UseGuards(AuthGuard())
@Controller('api/subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly stripeService: PaymentService,
    ) {}

    @Post('standard')
    async createStandardSubscription(@Body() data: AddCreditCardDto, @GetUser() user: User) {
        try {
            await this.stripeService.updateCustomer(user.stripeCustomerId, data.stripeToken);
            const subscriptionData = await this.subscriptionsService.createStandardSubscription(user.stripeCustomerId);
            await this.subscriptionsService.saveSubscriptionForUser(subscriptionData, user);
            return {data: {id: subscriptionData.id}, status: HttpStatus.OK};
        } catch (error) {
            throw new BadRequestException({ message: error.message });
        }
    }

    @Get('standard')
    async getStandardSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getStandardSubscription(data.customerId);
    }

    @Post('professional')
    async createProfessionalSubscription(@Body() data: AddCreditCardDto, @GetUser() user: User) {
        try {
            await this.stripeService.updateCustomer(user.stripeCustomerId, data.stripeToken);
            const subscriptionData = await this.subscriptionsService.createProfessionalSubscription(user.stripeCustomerId);
            await this.subscriptionsService.saveSubscriptionForUser(subscriptionData, user);
            return {data: {id: subscriptionData.id}, status: HttpStatus.OK};
        } catch (error) {
            throw new BadRequestException({ message: error.message });
        }
    }

    @Get('professional')
    async getProfessionalSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getProfessionalSubscription(data.customerId);
    }
}
