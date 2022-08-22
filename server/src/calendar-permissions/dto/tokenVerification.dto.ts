import {IsNotEmpty, IsString} from 'class-validator';

export class TokenVerificationDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}

export default TokenVerificationDto;
