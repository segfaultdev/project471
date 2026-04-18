/**
 * AuthController - Handles authentication HTTP endpoints
 * All routes are prefixed with '/auth'
 * 
 * Available endpoints:
 * POST /auth/register - Register new user (PUBLIC - no token needed)
 * POST /auth/login    - Login user (PUBLIC - no token needed)
 * GET  /auth/profile  - Get current user profile (PROTECTED - token required)
 */
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
  // Inject AuthService to access authentication logic
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/register - Register a new user
   * @Public() decorator makes this endpoint accessible without JWT token
   * 
   * Request:
   *   POST http://localhost:3000/auth/register
   *   Body: {
   *     "email": "john@example.com",
   *     "password": "password123",
   *     "firstName": "John",
   *     "lastName": "Doe"
   *   }
   * 
   * Response:
   *   {
   *     "access_token": "eyJhbGciOiJIUzI1NiIs...",
   *     "user": { "id": "uuid", "email": "john@example.com", ... }
   *   }
   */
  @Public() // Skip JWT authentication for registration
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login - Login existing user
   * @Public() decorator makes this endpoint accessible without JWT token
   * 
   * Request:
   *   POST http://localhost:3000/auth/login
   *   Body: {
   *     "email": "john@example.com",
   *     "password": "password123"
   *   }
   * 
   * Response:
   *   {
   *     "access_token": "eyJhbGciOiJIUzI1NiIs...",
   *     "user": { "id": "uuid", "email": "john@example.com", ... }
   *   }
   */
  @Public() // Skip JWT authentication for login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile - Get current logged-in user's profile
   * Requires valid JWT token in Authorization header
   * @UseGuards explicitly applies JWT guard (though it's global already)
   * @CurrentUser() decorator extracts user from JWT token
   * 
   * Request:
   *   GET http://localhost:3000/auth/profile
   *   Headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
   * 
   * Response:
   *   { "id": "uuid", "email": "john@example.com", ... }
   * 
   * How @CurrentUser() works:
   * 1. JWT token is validated by JwtAuthGuard
   * 2. User is fetched from database using ID in token
   * 3. User object is attached to request.user
   * 4. @CurrentUser() extracts it and passes to this method
   */
  @UseGuards(JwtAuthGuard) // Require JWT token (redundant but explicit)
  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }
}
