import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { ZoomService } from './zoom/zoom.service';
import { ZoomOAuthToken } from './zoom/entity/zoom-oauth-token.entity';
import { ZoomStrategy } from './zoom/zoom.strategy';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ZoomOAuthToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,
  ],
  controllers: [IntegrationsController],
  providers: [ZoomService, ZoomStrategy, IntegrationsService],
  exports: [ZoomService],
})
export class IntegrationsModule {}
