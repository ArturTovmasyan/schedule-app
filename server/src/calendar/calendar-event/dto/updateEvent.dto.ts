import { IsDateString, IsOptional, IsString } from 'class-validator';
import { MeetViaEnum } from 'src/sharable-links/enums/sharable-links.enum';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  meetLink: MeetViaEnum;

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
