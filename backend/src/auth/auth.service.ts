/**
 * AuthService - Core authentication business logic
 * Handles:
 * - User registration with duplicate email checking
 * - User login with credential validation
 * - JWT token generation
 * - Password validation
 */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    // Inject UsersService to access user database operations
    private usersService: UsersService,
    // Inject JwtService to create and verify tokens
    private jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials (email + password)
   * Called during login to check if credentials are correct
   * 
   * @param email - User's email address
   * @param password - Plain text password from login form
   * @returns User object (without password) if valid, null if invalid
   * 
   * Flow:
   * 1. Find user by email in database
   * 2. Compare plain password with hashed password
   * 3. Return user without password field
   */
  async validateUser(email: string, password: string): Promise<any> {
    // Step 1: Look up user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null; // User not found
    }

    // Step 2: Verify password using bcrypt
    // Compares 'password123' with '$2b$10$xyz...'
    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      return null; // Wrong password
    }

    // Step 3: Remove password from result for security
    // const { password: _, ...result } means:
    // "Extract password into _ (throwaway), put everything else into result"
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Login user and generate JWT token
   * 
   * @param loginDto - Contains email and password
   * @returns Object with access_token (JWT) and user data
   * @throws UnauthorizedException if credentials are invalid
   * 
   * Flow:
   * 1. Validate credentials
   * 2. Create JWT payload with user info
   * 3. Sign JWT token with secret key
   * 4. Return token + user data
   */
  async login(loginDto: LoginDto) {

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }


    const payload = { 
      email: user.email, 
      sub: user.id,      
      role: user.role    
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  /**
   * Register a new user
   * 
   * @param registerDto - Contains email, password, firstName, lastName, role
   * @returns Object with access_token (JWT) and user data
   * @throws ConflictException if email already exists
   * 
   * Flow:
   * 1. Check if email is already taken
   * 2. Create user (password is hashed in UsersService)
   * 3. Generate JWT token for auto-login
   * 4. Return token + user data
   */
  async register(registerDto: RegisterDto) {

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      role: registerDto.role as any,
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  /**
   * Get user profile by userId
   * Used by /auth/profile endpoint
   * 
   * @param userId - User's UUID from JWT token
   * @returns User object
   */
  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}
