import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false, type: 'boolean' })
  @IsBoolean()
  remember: boolean;
}
