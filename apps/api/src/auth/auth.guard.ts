import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isUUID } from 'class-validator';
import { UsersService } from '../users/users.service';

export interface AuthenticatedRequest {
  headers: { authorization?: string };
  user: { sub: string };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Invalid or missing token');
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(match[1], { algorithms: ['HS256'] });
      if (typeof payload.sub !== 'string' || !isUUID(payload.sub) || typeof payload.exp !== 'number') {
        throw new Error('Invalid claims');
      }
      request.user = { sub: payload.sub };
    } catch {
      throw new UnauthorizedException('Invalid or missing token');
    }
    if (!await this.usersService.findById(request.user.sub)) throw new UnauthorizedException('Invalid or missing token');
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.headers.authorization === undefined) return true;
    return super.canActivate(context);
  }
}
