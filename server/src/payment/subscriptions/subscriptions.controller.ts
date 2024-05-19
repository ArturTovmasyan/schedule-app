import {Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import SubscriptionsService from "../subscriptions.service";
import {AuthGuard} from "@nestjs/passport";
import AddCreditCardDto from "../dto/add-credit-card.dto";
import {GetUser} from "../../components/decorators/get-user.decorator";
import {User} from "@user/entity/user.entity";

@UseGuards(AuthGuard())
@Controller('api/subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService
    ) {}

    @Post('standard')
    async createStandardSubscription(@Body() data: AddCreditCardDto, @Request() req, @GetUser() user: User) {
        debugger;
        const subData = this.subscriptionsService.createStandardSubscription(data.customerId, data.paymentMethodId);
        //TODO add subId to user entity
    }

    @Get('standard')
    async getStandardSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getStandardSubscription(data.customerId);
    }

    @Post('professional')
    async createProfessionalSubscription(@Body() data: AddCreditCardDto, @Request() req, @GetUser() user: User) {
        debugger;
        return this.subscriptionsService.createProfessionalSubscription(data.customerId, data.paymentMethodId);
    }

    @Get('professional')
    async getProfessionalSubscription(@Body() data: AddCreditCardDto) {
        return this.subscriptionsService.getProfessionalSubscription(data.customerId);
    }
}
