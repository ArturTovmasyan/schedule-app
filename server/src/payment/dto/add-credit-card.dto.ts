import { IsString, IsNotEmpty } from 'class-validator';

export class AddCreditCardDto {
    @IsString()
    @IsNotEmpty()
    paymentMethodId: string;

    @IsString()
    @IsNotEmpty()
    customerId: string;
}

export default AddCreditCardDto;
