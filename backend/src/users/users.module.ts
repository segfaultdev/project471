/**
 * UsersModule - Configures everything related to users
 * This module:
 * 1. Registers the User entity with TypeORM (for database operations)
 * 2. Declares the UsersController (handles HTTP requests)
 * 3. Provides the UsersService (business logic)
 * 4. Exports UsersService (so other modules like AuthModule can use it)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    // Register User entity - gives us access to User database table
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController], // Register HTTP routes
  providers: [UsersService],      // Register services for dependency injection
  exports: [UsersService],        // Export so AuthModule can inject UsersService
})
export class UsersModule {}
