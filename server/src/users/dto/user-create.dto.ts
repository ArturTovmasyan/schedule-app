import {IsNotEmpty, IsString, Matches} from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  firstName: string;
  @IsNotEmpty()
  @IsString()
  lastName: string;
  @IsNotEmpty()
  @IsString()
  @Matches(
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
      { message: 'Invalid password' },
  )
  password: string;

  @Expose({ name: 'status' })
  @IsNumber()
  status: number = 0;

  @Expose({ name: 'oauth_id' })
  @IsNumber()
  oauthId: number = 0;

  @Expose({ name: 'provider' })
  @IsString()
  provider: string;

  @Expose({ name: 'stripe_customer_id' })
  @IsString()
  stripeCustomerId: string;
}
