import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UsersService } from '../users/users.service';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @Post('sessions')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid email or password', type: ErrorResponseDto })
  @ApiResponse({ status: 422, description: 'Invalid input', type: ErrorResponseDto })
  async login(@Body() input: LoginDto): Promise<TokenResponseDto> {
    return { data: await this.authService.login(input), links: { self: '/sessions', profile: '/users/me' } };
  }

  @Get('users/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid token or user no longer exists', type: ErrorResponseDto })
  async me(@Req() request: AuthenticatedRequest): Promise<UserResponseDto> {
    const user = await this.usersService.findById(request.user.sub);
    if (!user) throw new UnauthorizedException('Invalid or missing token');
    return { data: user, links: { self: '/users/me' } };
  }
}
