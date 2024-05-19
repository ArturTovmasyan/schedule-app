import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { GetUser } from 'src/components/decorators/get-user.decorator';
import { User } from '@user/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(AuthGuard())
  @Post()
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @GetUser() user: User,
  ) {
    return this.invitationService.create(user, createInvitationDto);
  }

  @Get()
  findAll() {
    return this.invitationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invitationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.invitationService.update(id);
  }

  @Patch('pre-social-login/:id')
  setToPreSocialLogin(@Param('id') id: string) {
    return this.invitationService.setToPreSocialLogin(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationService.remove(+id);
  }
}
