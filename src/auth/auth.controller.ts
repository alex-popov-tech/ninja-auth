import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from '../utils';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('signup')
  async signUp(@Body(ValidationPipe) args: SignUpDto) {
    const existingUser = await this.usersService.findFirst({
      email: args.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with such email already exists.');
    }
    return await this.authService.signUp(args);
  }

  @Public()
  @Post('signin')
  async signIn(@Body(ValidationPipe) args: SignInDto) {
    return await this.authService.signIn(args);
  }

  @Post('signout')
  async signOut(@Req() request: Request) {
    const token: string = request['token'];
    return await this.authService.signOut(token);
  }
}
