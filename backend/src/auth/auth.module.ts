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
    UsersModule,
    
    PassportModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
        
        signOptions: { 
          expiresIn: '7d'  // Tokens expire after 7 days
        },
      }),
      inject: [ConfigService],
    }),
  ],
  
  controllers: [AuthController],
  
  providers: [
    AuthService,      // Authentication business logic
    JwtStrategy,      // JWT token validation strategy
    LocalStrategy,    // Username/password validation strategy (not used currently)
  ],
  
  exports: [AuthService],
})
export class AuthModule {}
