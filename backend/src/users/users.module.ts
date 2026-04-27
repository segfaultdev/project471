import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController], // Register HTTP routes
  providers: [UsersService],      // Register services for dependency injection
  exports: [UsersService],        // Export so AuthModule can inject UsersService
})
export class UsersModule {}
