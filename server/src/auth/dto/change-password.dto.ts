import { ApiProperty } from '@nestjs/swagger';
import {IsString, Matches, IsNotEmpty, IsOptional} from 'class-validator';
import { ErrorMessages } from 'src/components/constants/error.messages';

export class ResetPasswordDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: 'Invalid password' },
  )
  readonly password: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsOptional()
  readonly currentPassword: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: ErrorMessages.passwordDoesNotMatch },
  )
  readonly newPassword: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: ErrorMessages.passwordDoesNotMatch },
  )
  readonly confirmPassword: string;
}
