import {BadRequestException, Body, Controller, Get, HttpStatus, Post, UseGuards} from '@nestjs/common';
import SubscriptionsService from "./subscriptions.service";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "../dto/add-credit-card.dto";
import {GetUser} from "../../components/decorators/get-user.decorator";
import {User} from "@user/entity/user.entity";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {PaymentService} from "../payment.service";
import {ConfigService} from "@nestjs/config";

@ApiBearerAuth()
@ApiTags('Payment Subscription')
@UseGuards(AuthGuard())
@Controller('api/subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly stripeService: PaymentService,
        private readonly configService: ConfigService
    ) {
    }

    @Post('standard')
    async createStandardSubscription(@Body() data: AddCreditCardDto, @GetUser() user: User) {
        try {
            const priceId = this.configService.get('STANDARD_SUBSCRIPTION_PRICE_ID');
            await this.stripeService.updateCustomer(user.stripeCustomerId, data.stripeToken);
            const subscriptionData = await this.subscriptionsService.createSubscription(user.stripeCustomerId, priceId);

            if (subscriptionData) {
                await this.subscriptionsService.saveSubscriptionForUser(subscriptionData, user);
                return {data: {id: subscriptionData.id}, status: HttpStatus.OK};
            }
        } catch (error) {
            throw new BadRequestException({message: error.message});
        }
    }

    @Get('standard')
    async getStandardSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getSubscription(data.customerId);
    }

    @Post('professional')
    async createProfessionalSubscription(@Body() data: AddCreditCardDto, @GetUser() user: User) {
        try {
            const priceId = this.configService.get('PROFESSIONAL_SUBSCRIPTION_PRICE_ID');
            await this.stripeService.updateCustomer(user.stripeCustomerId, data.stripeToken);
            const subscriptionData = await this.subscriptionsService.createSubscription(user.stripeCustomerId, priceId);

            if (subscriptionData) {
                await this.subscriptionsService.saveSubscriptionForUser(subscriptionData, user);
                return {data: {id: subscriptionData.id}, status: HttpStatus.OK};
            }
        } catch (error) {
            throw new BadRequestException({message: error.message});
        }
    }

    @Get('professional')
    async getProfessionalSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getSubscription(data.customerId);
    }
}
