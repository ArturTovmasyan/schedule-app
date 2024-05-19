import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiExcludeEndpoint,
  ApiHideProperty,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  IResponse,
  IResponseMessage,
} from 'src/components/interfaces/response.interface';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

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
  @UsePipes(new ValidationPipe())
  async create(@Body() userDto: UserCreateDto): Promise<UserDto> {
    return await this.usersService.create(userDto);
  }

  @ApiResponse({ type: IResponseMessage })
  @ApiOperation({ summary: 'Update user data' })
  @Put(':id')
  @UseGuards(AuthGuard())
  @UsePipes(new ValidationPipe())
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
