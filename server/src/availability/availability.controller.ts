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

import { GetUser } from 'src/components/decorators/get-user.decorator';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AvailabilityService } from './availability.service';
import { User } from '@user/entity/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Calendar availablity')
@Controller('api/calendar')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('availability')
  @UseGuards(AuthGuard())
  create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @GetUser() user,
  ) {
    return this.availabilityService.create(user, createAvailabilityDto);
  }

  @Get('availability')
  @UseGuards(AuthGuard())
  findAll(@GetUser() user) {
    return this.availabilityService.findAll(user);
  }

  @Get('availability/:id')
  findOne(@Param('id') id: string) {
    return this.availabilityService.findOne(+id);
  }

  @Patch('availability')
  @UseGuards(AuthGuard())
  update(
    @GetUser() user: User,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(user, updateAvailabilityDto);
  }

  @Delete('availability/:id')
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(+id);
  }
}
