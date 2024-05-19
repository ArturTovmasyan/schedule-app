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
  ApiExcludeEndpoint,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/components/decorators/get-user.decorator';
import { AccessRequestService } from './access-request.service';
import { User } from '@user/entity/user.entity';
import {
  AccessRequestStatus,
  CreateAccessRequestDto,
  AccessRequestQueryParams,
} from './dto/create-access-request.dto';

import {
  IResponse,
  IResponseMessage,
} from 'src/components/interfaces/response.interface';

@ApiBearerAuth()
@ApiTags('Access Request')
@Controller('api/calendar/access-request')
export class AccessRequestController {
  constructor(private readonly accessRequestService: AccessRequestService) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Create Access request' })
  @UseGuards(AuthGuard())
  @Post()
  create(
    @GetUser() user: User,
    @Body() createAccessRequestDto: CreateAccessRequestDto,
  ) {
    return this.accessRequestService.create(user, createAccessRequestDto);
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find all Access requests' })
  @UseGuards(AuthGuard())
  @Get()
  findAll(@GetUser() user: User, @Query() query: AccessRequestQueryParams) {
    return this.accessRequestService.findAll(user, query);
  }

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard())
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessRequestService.findOne(+id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Accept or decline access request' })
  @UseGuards(AuthGuard())
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() accessRequestStatus: AccessRequestStatus,
  ) {
    return this.accessRequestService.update(user, id, accessRequestStatus);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Delete Access requests' })
  @UseGuards(AuthGuard())
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.accessRequestService.remove(user, id);
  }
}
