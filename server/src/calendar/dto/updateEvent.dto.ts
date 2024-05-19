import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  meetLink: string;

  @IsString()
  @IsDateString()
  @IsOptional()
  start: string;

  @IsString()
  @IsDateString()
  @IsOptional()
  end: string;
}

export default UpdateEventDto;
