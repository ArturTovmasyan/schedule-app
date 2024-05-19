import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/components/decorators/get-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';
import { User } from '@user/entity/user.entity';
import {
  IResponseMessage,
  IResponse,
} from 'src/components/interfaces/response.interface';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Create Notification' })
  @UseGuards(AuthGuard())
  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @GetUser() user: User,
  ) {
    return this.notificationsService.create(user, createNotificationDto);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find all notifications' })
  @UseGuards(AuthGuard())
  @Get()
  findAll(@GetUser() user: User) {
    return this.notificationsService.findAll(user);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find count of unread notifications' })
  @UseGuards(AuthGuard())
  @Get('count')
  findUnreadCount(@GetUser() user: User) {
    return this.notificationsService.findUnreadCount(user);
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({
    summary: 'Mark as read notifications(excluding access requests)',
  })
  @UseGuards(AuthGuard())
  @Patch()
  markAsRead(@GetUser() user: User) {
    return this.notificationsService.markAsRead(user);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Mark as read notification by ID' })
  @UseGuards(AuthGuard())
  @Patch(':id')
  markAsReadById(@GetUser() user: User, @Param('id') id: string) {
    return this.notificationsService.markAsReadById(id, user);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Delete notification by ID' })
  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.notificationsService.remove(id, user);
  }
}
