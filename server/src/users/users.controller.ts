import {
  Body,
  Controller,
  Delete,
  Get, HttpStatus, NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserCreateDto } from './dto/user-create.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import {ErrorMessages} from "@shared/error.messages";

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

  @Post('check-email')
  public async checkUserByEmail(
      @Body() dto: UserDto,
  ): Promise<UserDto> {
    const user: UserDto = await this.usersService.findOneByEmail(dto);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: ErrorMessages.userNotFound,
      });
    }
    return user;
  }
}
