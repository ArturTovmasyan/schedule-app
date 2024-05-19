import {
  IsArray,
  IsEmail,
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  giveAccess: Boolean;
}
