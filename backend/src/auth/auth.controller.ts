import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth') // All routes start with /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Skip JWT authentication for registration
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public() // Skip JWT authentication for login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard) // Require JWT token (redundant but explicit)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
