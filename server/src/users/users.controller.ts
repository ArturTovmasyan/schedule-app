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
import { ApiHideProperty, ApiTags } from '@nestjs/swagger';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard())
  async findAll(): Promise<UserDto[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  async findOneById(@Param('id') id: string) {
    return await this.usersService.findOneById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  @UsePipes(new ValidationPipe())
  async create(@Body() userDto: UserCreateDto): Promise<UserDto> {
    return await this.usersService.create(userDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() userDto: UserDto,
  ): Promise<UserDto> {
    return await this.usersService.update(id, userDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async delete(@Param('id') id: string): Promise<UserDto> {
    return await this.usersService.delete(id);
  }
}
