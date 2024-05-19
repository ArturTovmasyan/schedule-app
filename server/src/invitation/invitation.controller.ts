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
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { IResponseMessage } from 'src/components/interfaces/response.interface';
import { User } from '@user/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Invitation API')
@Controller('api/invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Send invitation to email' })
  @UseGuards(AuthGuard())
  @Post()
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @GetUser() user: User,
  ) {
    return this.invitationService.create(user, createInvitationDto);
  }

  @ApiExcludeEndpoint()
  @Get()
  findAll() {
    return this.invitationService.findAll();
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitationService.findOne(+id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Accept invitation' })
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.invitationService.update(id);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Set invitation status as pre social login' })
  @Patch('pre-social-login/:id')
  setToPreSocialLogin(@Param('id') id: string) {
    return this.invitationService.setToPreSocialLogin(id);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationService.remove(+id);
  }
}
