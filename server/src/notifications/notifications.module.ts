import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AccessRequest } from 'src/access-request/entities/access-request.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsEntity } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { User } from '@user/entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User, NotificationsEntity, AccessRequest]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
