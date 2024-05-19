import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class TimeIntervalDto {
  @IsString()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsDateString()
  @IsNotEmpty()
  dateEnd: string;
}

export default TimeIntervalDto;
