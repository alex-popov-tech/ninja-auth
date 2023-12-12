import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import * as _ from 'lodash';

function omitPassword(user: any) {
  return _.omit(user, 'password');
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  async findMany() {
    const users = await this.usersService.findMany();
    return users.map(omitPassword);
  }

  @Get('/me')
  async findMe(@Req() req: Request) {
    const { id } = req['user'] as { id: number };
    return this.findFirst(id);
  }

  @Get('/:id')
  async findFirst(@Param(ParseIntPipe) id: number) {
    const user = await this.usersService.findFirst({ id });
    return omitPassword(user);
  }
}
