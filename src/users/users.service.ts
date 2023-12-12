import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async create(data: CreateUserDto) {
    return await this.databaseService.user.create({ data });
  }

  async findMany() {
    return await this.databaseService.user.findMany();
  }

  async findFirst(where: { id?: number; email?: string }) {
    return await this.databaseService.user.findFirst({ where });
  }
}
