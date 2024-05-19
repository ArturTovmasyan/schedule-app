import {IsString, IsNotEmpty, IsNumber} from 'class-validator';

export class CardDto {
    @IsString()
    @IsNotEmpty()
    number: string;

    @IsString()
    @IsNotEmpty()
    exp_month: any;

    @IsString()
    @IsNotEmpty()
    exp_year: string;

    @IsNumber()
    @IsNotEmpty()
    cvc: number;
}
