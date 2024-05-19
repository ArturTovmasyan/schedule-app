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
@ApiTags('Calendar accessibility')
@Controller('api/calendar-accessibility')
export class CalendarAccessibilityController {
  constructor(
    private readonly calendarAccessibilityService: CalendarAccessibilityService,
  ) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Set user accessibility' })
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

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find user accessibility' })
  @UseGuards(AuthGuard())
  @Get()
  findAll(@GetUser() user: User) {
    return this.calendarAccessibilityService.findAll(user);
  }

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard())
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarAccessibilityService.findOne(+id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Update user accessibility' })
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

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Remove user accessibility' })
  @UseGuards(AuthGuard())
  @Delete()
  remove(@GetUser() user: User) {
    return this.calendarAccessibilityService.remove(user);
  }
}
