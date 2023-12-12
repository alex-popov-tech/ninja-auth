import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@songkeys/nestjs-redis';
import * as bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import * as _ from 'lodash';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private redis: Redis,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(args: SignUpDto) {
    const password = await bcrypt.hash(args.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      ...args,
      password,
    });
    return _.omit(user, 'password');
  }

  async signIn(args: SignInDto) {
    const user = await this.usersService.findFirst({ email: args.email });
    if (!user) {
      throw new UnauthorizedException();
    }
    const passwordsMatch = await bcrypt.compare(args.password, user.password);
    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    const jti = uuidv4();
    const access_token = await this.jwtService.signAsync({
      ..._.omit(user, 'password', 'id'),
      sub: user.id,
      jti,
    });

    await this.redis.set(
      `whitelist:${jti}`,
      '',
      'EX',
      +process.env.JWT_EXPIRATION,
    );
    return { access_token };
  }

  async signOut(token: string) {
    const { jti } = this.jwtService.decode<{ jti: string }>(token);

    await this.redis.del(`whitelist:${jti}`);
  }
}
