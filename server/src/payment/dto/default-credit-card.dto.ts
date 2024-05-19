import { IsString, IsNotEmpty } from 'class-validator';

export class DefaultCreditCardDto {
    @IsString()
    @IsNotEmpty()
    paymentMethodId: string;
}

export default DefaultCreditCardDto;
