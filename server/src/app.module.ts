import { Module } from '@nestjs/common';
import { ConnectionOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AvailabilityModule } from './availability/availability.module';
import { AuthController } from './auth/auth.controller';
import { AppController } from './app.controller';
import { UsersModule } from '@user/users.module';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AvailabilityModule,
    ConfigModule.forRoot({
      isGlobal: false,
      expandVariables: true,
      load: [AppConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get<ConnectionOptions>('database');
      },
      inject: [ConfigService],
    }),
    PaymentModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
