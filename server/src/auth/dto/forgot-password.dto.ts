import {IsEmail, IsNotEmpty} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({required:true,type:'string'})
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
