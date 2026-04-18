/**
 * UsersController - Handles HTTP requests for user operations
 * All routes are prefixed with '/users'
 * All routes are protected by JWT authentication (from global guard in app.module.ts)
 * 
 * Available endpoints:
 * POST   /users       - Create new user
 * GET    /users       - Get all users
 * GET    /users/:id   - Get single user by ID
 * PATCH  /users/:id   - Update user
 * DELETE /users/:id   - Delete user
 */
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users') // All routes start with /users
export class UsersController {
  // Inject UsersService to access business logic
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users - Create a new user
   * Example: POST http://localhost:3000/users
   * Body: { "email": "test@test.com", "password": "123456", ... }
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users - Get all users
   * Returns array of all users (passwords excluded)
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id - Get single user by ID
   * @Param extracts ':id' from URL path
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id - Partial update of user
   * Only send fields you want to change
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id - Delete user permanently
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
