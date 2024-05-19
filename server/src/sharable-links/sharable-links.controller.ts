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
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import {
  IResponse,
  IResponseMessage,
} from 'src/components/interfaces/response.interface';
import {
  CreateSharableLinkDto,
  PaginationDto,
} from './dto/create-sharable-link.dto';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { SharableLinkEntity } from './entities/sharable-link.entity';
import { SharableLinksService } from './sharable-links.service';
import { User } from '@user/entity/user.entity';
import { UpdateSharableLinkDto } from './dto/update-sharable-link.dto';

@ApiBearerAuth()
@ApiTags('Sharable links API')
@Controller('api/sharable-links')
export class SharableLinksController {
  constructor(private readonly sharableLinksService: SharableLinksService) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Create Sharable link' })
  @UseGuards(AuthGuard())
  @Post()
  create(
    @Body() createSharableLinkDto: CreateSharableLinkDto,
    @GetUser() user: User,
  ) {
    return this.sharableLinksService.create(user, createSharableLinkDto);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Get My Sharable links' })
  @UseGuards(AuthGuard())
  @Get()
  findAll(@GetUser() user: User, @Query() query: PaginationDto) {
    return this.sharableLinksService.findAll(user, {
      limit: query.limit,
      offset: query.offset,
    });
  }

  @ApiResponse({ type: IResponse<SharableLinkEntity> })
  @ApiOperation({ summary: 'Get Sharable link by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sharableLinksService.findOne(id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Select slot for scheduling meeting' })
  @UseGuards(AuthGuard())
  @Patch('select-slot/:slotId')
  selectSlot(@Param('slotId') slotId: string, @GetUser() user: User) {
    return this.sharableLinksService.selectSlot(user, slotId);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Select slot for scheduling meeting' })
  @UseGuards(AuthGuard())
  @Patch(':sharableLinkId')
  update(
    @Body() updateSharableLinkDto: UpdateSharableLinkDto,
    @Param('sharableLinkId') sharableLinkId: string,
    @GetUser() user: User,
  ) {
    return this.sharableLinksService.update(
      sharableLinkId,
      user,
      updateSharableLinkDto,
    );
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Delete Sharable link' })
  @UseGuards(AuthGuard())
  @Delete(':sharableLinkId')
  remove(
    @Param('sharableLinkId') sharableLinkId: string,
    @GetUser() user: User,
  ) {
    return this.sharableLinksService.remove(user, sharableLinkId);
  }
}
