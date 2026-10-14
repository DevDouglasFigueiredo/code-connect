import { Body, Controller, Header, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Header('Location', '/users/me')
  @ApiOperation({ summary: 'Register a user (does not sign in)' })
  @ApiCreatedResponse({ type: UserResponseDto, headers: { Location: { schema: { type: 'string', example: '/users/me' }, description: 'Profile URI; requires login' } } })
  @ApiResponse({ status: 422, description: 'Invalid input or duplicate email', type: ErrorResponseDto })
  async create(@Body() input: CreateUserDto): Promise<UserResponseDto> {
    return { data: await this.usersService.create(input), links: { self: '/users/me', login: '/sessions' } };
  }
}
