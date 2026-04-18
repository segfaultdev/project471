/**
 * AuthModule - Configures authentication system
 * 
 * This module sets up:
 * 1. JWT token generation and validation
 * 2. Passport strategies (JWT and Local)
 * 3. Authentication service and controller
 * 4. Integration with UsersModule
 * 
 * JWT Configuration:
 * - Secret key: JWT_SECRET from .env (used to sign/verify tokens)
 * - Expiration: 7 days (tokens expire after 7 days)
 * - Algorithm: HS256 (HMAC with SHA-256)
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    // Import UsersModule to access UsersService
    // UsersModule exports UsersService which we need for authentication
    UsersModule,
    
    // Import PassportModule for authentication strategies
    PassportModule,
    
    // Configure JWT module using ConfigService (async)
    // This ensures JWT_SECRET is loaded from .env file correctly
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Secret key for signing tokens - MUST match jwt.strategy.ts
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
        
        // Token configuration
        signOptions: { 
          expiresIn: '7d'  // Tokens expire after 7 days
          // After 7 days, users must login again to get new token
        },
      }),
      inject: [ConfigService],
    }),
  ],
  
  // Register HTTP routes
  controllers: [AuthController],
  
  // Register services and strategies for dependency injection
  providers: [
    AuthService,      // Authentication business logic
    JwtStrategy,      // JWT token validation strategy
    LocalStrategy,    // Username/password validation strategy (not used currently)
  ],
  
  // Export AuthService so other modules can use it
  exports: [AuthService],
})
export class AuthModule {}
