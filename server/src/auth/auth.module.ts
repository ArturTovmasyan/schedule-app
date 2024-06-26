import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@user/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import * as dotenv from 'dotenv';
import {MailModule} from "../mail/mail.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "@user/entity/user.entity";
import {ConfigModule} from "@nestjs/config";
import {GoogleStrategy} from "./google.strategy";
import {AzureADStrategy} from "./microsoft.strategy";
import {PaymentService} from "../payment/payment.service";
dotenv.config();

@Module({
  imports: [
    UsersModule,
    MailModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, AzureADStrategy, PaymentService],
  exports: [PassportModule, JwtModule, AuthService, AzureADStrategy],
})
export class AuthModule {}
