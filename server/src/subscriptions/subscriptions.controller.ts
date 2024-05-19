import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import SubscriptionsService from "../payment/subscriptions.service";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "../payment/dto/add-credit-card.dto";

@Controller('api/subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    @Post('standard')
    @UseGuards(AuthGuard())
    async createStandardSubscription(@Body() data: AddCreditCardDto) {
        debugger;
        return this.subscriptionsService.createStandardSubscription(data.customerId);
    }

    @Get('standard')
    @UseGuards(AuthGuard())
    async getStandardSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getStandardSubscription(data.customerId);
    }

    @Post('professional')
    @UseGuards(AuthGuard())
    async createProfessionalSubscription(@Body() data: AddCreditCardDto) {
        debugger;
        return this.subscriptionsService.createProfessionalSubscription(data.customerId);
    }

    @Get('professional')
    @UseGuards(AuthGuard())
    async getProfessionalSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getProfessionalSubscription(data.customerId);
    }
}
