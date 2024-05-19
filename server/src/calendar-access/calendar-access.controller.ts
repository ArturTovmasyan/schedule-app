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
import { AuthGuard } from '@nestjs/passport';

import { UpdateCalendarAccessDto } from './dto/update-calendar-access.dto';
import { CreateCalendarAccessDto } from './dto/create-calendar-access.dto';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { CalendarAccessService } from './calendar-access.service';
import { User } from '@user/entity/user.entity';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IResponse,
  IResponseMessage,
} from 'src/components/interfaces/response.interface';

@ApiBearerAuth()
@ApiTags('Calendar Access')
@Controller('api/calendar-access')
export class CalendarAccessController {
  constructor(private readonly calendarAccessService: CalendarAccessService) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Give access to calendar' })
  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createCalendarAccessDto: CreateCalendarAccessDto,
    @GetUser() user: User,
  ) {
    return this.calendarAccessService.create(user, createCalendarAccessDto);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Get accessed calendars' })
  @UseGuards(AuthGuard())
  @Get('accessed')
  findAccessed(@GetUser() user: User) {
    return this.calendarAccessService.findAccessed(user);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Get shared calendars' })
  @UseGuards(AuthGuard())
  @Get('shared')
  findShared(@GetUser() user: User) {
    return this.calendarAccessService.findShared(user);
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarAccessService.findOne(+id);
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCalendarAccessDto: UpdateCalendarAccessDto,
  ) {
    return this.calendarAccessService.update(+id, updateCalendarAccessDto);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarAccessService.remove(+id);
  }
}
