import {
  Get,
  Put,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { GetUser } from 'src/components/decorators/get-user.decorator';
import { UserCreateDto } from './dto/user-create.dto';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { UserDto } from './dto/user.dto';
import {
  IResponseMessage,
  IResponse,
} from 'src/components/interfaces/response.interface';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find all users' })
  @Get()
  @UseGuards(AuthGuard())
  async findAll(): Promise<UserDto[]> {
    return await this.usersService.findAll();
  }

  @ApiResponse({ type: IResponse })
  @ApiOperation({ summary: 'Find user by id' })
  @Get(':id')
  @UseGuards(AuthGuard())
  async findOneById(@Param('id') id: string) {
    return await this.usersService.findOneById(id);
  }

  @ApiExcludeEndpoint()
  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() userDto: UserCreateDto): Promise<UserDto> {
    return await this.usersService.create(userDto);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Set user avatar' })
  @UseInterceptors(FileInterceptor('file'))
  @Put('avatar')
  @UseGuards(AuthGuard())
  async setUserAvatar(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IResponseMessage> {
    return await this.usersService.setUserAvatar(user, file);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Update user data' })
  @Put(':id')
  @UseGuards(AuthGuard())
  async update(
    @Param('id') id: string,
    @Body() userDto: UserDto,
  ): Promise<UserDto> {
    return await this.usersService.update(id, userDto);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  @UseGuards(AuthGuard())
  async delete(@Param('id') id: string): Promise<UserDto> {
    return await this.usersService.delete(id);
  }
}
