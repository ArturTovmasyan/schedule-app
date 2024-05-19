import {Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import SubscriptionsService from "../payment/subscriptions.service";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "../payment/dto/add-credit-card.dto";

@UseGuards(AuthGuard())
@Controller('api/subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    @Post('standard')
    async createStandardSubscription(@Body() data: AddCreditCardDto, @Request() req) {
        debugger;
        const user = req.user;
        const subData = this.subscriptionsService.createStandardSubscription(data.customerId, data.paymentMethodId);
        //TODO add subId to user entity
    }

    @Get('standard')
    async getStandardSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getStandardSubscription(data.customerId);
    }

    @Post('professional')
    async createProfessionalSubscription(@Body() data: AddCreditCardDto, @Request() req) {
        debugger;
        const user = req.user;
        return this.subscriptionsService.createProfessionalSubscription(data.customerId, data.paymentMethodId);
    }

    @Get('professional')
    async getProfessionalSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getProfessionalSubscription(data.customerId);
    }
}
