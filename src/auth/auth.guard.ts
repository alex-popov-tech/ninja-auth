import Redis from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../utils';
import { Reflector } from '@nestjs/core';

function extractAuthToken(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRedis() private redis: Redis,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = extractAuthToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const { jti } = this.jwtService.decode(token);
    const isWhitelisted = await this.redis.exists(`whitelist:${jti}`);

    if (!isWhitelisted) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET,
      });

      request['user'] = payload;
      request['token'] = token;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
