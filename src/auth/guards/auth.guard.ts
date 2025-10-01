import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // Simple check: allow if user exists on request
    const authorization = request.headers['authorization'];
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);
      request.user = {
        user_id: tokenPayload.sub,
        email: tokenPayload.email,
        user_role: tokenPayload.user_role,
      };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
