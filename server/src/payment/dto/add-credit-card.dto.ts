import {IsString, IsNotEmpty, IsOptional} from 'class-validator';

export class AddCreditCardDto {
    @IsString()
    @IsNotEmpty()
    stripeToken: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    customerId: string;
}

export default AddCreditCardDto;
