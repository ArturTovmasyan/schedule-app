import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChargeDto {
    @IsString()
    @IsNotEmpty()
    paymentMethodId: string;

    @IsString()
    @IsNotEmpty()
    stripeCustomerId: string;

    @IsNumber()
    amount: number;
}

export default CreateChargeDto;
