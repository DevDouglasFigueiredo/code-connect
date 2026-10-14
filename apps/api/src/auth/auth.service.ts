import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async login(input: LoginDto): Promise<TokenDto> {
    const user = await this.usersService.verifyCredentials(input.email, input.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    return {
      access_token: await this.jwtService.signAsync({ sub: user.id }),
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }
}
