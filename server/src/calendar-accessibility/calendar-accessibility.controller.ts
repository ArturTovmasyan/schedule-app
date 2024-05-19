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

import { UpdateCalendarAccessibilityDto } from './dto/update-calendar-accessibility.dto';
import { CreateCalendarAccessibilityDto } from './dto/create-calendar-accessibility.dto';
import { CalendarAccessibilityService } from './calendar-accessibility.service';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { User } from '@user/entity/user.entity';

@Controller('calendar-accessibility')
export class CalendarAccessibilityController {
  constructor(
    private readonly calendarAccessibilityService: CalendarAccessibilityService,
  ) {}

  @UseGuards(AuthGuard())
  @Post()
  create(
    @Body() createCalendarAccessibilityDto: CreateCalendarAccessibilityDto,
    @GetUser() user: User,
  ) {
    return this.calendarAccessibilityService.create(
      user,
      createCalendarAccessibilityDto,
    );
  }

  @UseGuards(AuthGuard())
  @Get()
  findAll(@GetUser() user: User) {
    return this.calendarAccessibilityService.findAll(user);
  }

  @UseGuards(AuthGuard())
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarAccessibilityService.findOne(+id);
  }

  @UseGuards(AuthGuard())
  @Patch()
  update(
    @Body() updateCalendarAccessibilityDto: UpdateCalendarAccessibilityDto,
    @GetUser() user: User,
  ) {
    return this.calendarAccessibilityService.update(
      user,
      updateCalendarAccessibilityDto,
    );
  }

  @UseGuards(AuthGuard())
  @Delete()
  remove(@GetUser() user: User) {
    return this.calendarAccessibilityService.remove(user);
  }
}
