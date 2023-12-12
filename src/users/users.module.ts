import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '@src/auth/auth.module';
import { DatabaseModule } from '@src/database/database.module';

@Module({
  imports: [forwardRef(() => AuthModule), DatabaseModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
