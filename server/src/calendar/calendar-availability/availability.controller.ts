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
@ApiTags('Calendar availability')
@Controller('api/calendar/availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Create user availability' })
  @Post()
  @UseGuards(AuthGuard())
  create(
    @Body() createAvailabilityDto: CreateAvailabilityDto,
    @GetUser() user,
  ) {
    return this.availabilityService.create(user, createAvailabilityDto);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find user availability' })
  @Get()
  @UseGuards(AuthGuard())
  findAll(@GetUser() user) {
    return this.availabilityService.findAll(user);
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availabilityService.findOne(+id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Update user avaliliability' })
  @Patch()
  @UseGuards(AuthGuard())
  update(
    @GetUser() user: User,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.update(user, updateAvailabilityDto);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(+id);
  }
}