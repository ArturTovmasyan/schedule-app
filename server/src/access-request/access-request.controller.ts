import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/components/decorators/get-user.decorator';
import { AccessRequestService } from './access-request.service';
import { User } from '@user/entity/user.entity';
import {
  AccessRequestQueryParams,
  AccessRequestStatus,
  CreateAccessRequestDto,
} from './dto/create-access-request.dto';

@Controller('api/calendar-event/access-request')
export class AccessRequestController {
  constructor(private readonly accessRequestService: AccessRequestService) {}

  @UseGuards(AuthGuard())
  @Post()
  create(
    @GetUser() user: User,
    @Body() createAccessRequestDto: CreateAccessRequestDto,
  ) {
    return this.accessRequestService.create(user, createAccessRequestDto);
  }

  @UseGuards(AuthGuard())
  @Get()
  findAll(@GetUser() user: User, @Query() query: AccessRequestQueryParams) {
    return this.accessRequestService.findAll(user, query);
  }

  @UseGuards(AuthGuard())
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessRequestService.findOne(+id);
  }

  @UseGuards(AuthGuard())
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() accessRequestStatus: AccessRequestStatus,
  ) {
    return this.accessRequestService.update(user, id, accessRequestStatus);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.accessRequestService.remove(user, id);
  }
}
