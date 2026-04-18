/**
 * JwtStrategy - Validates JWT tokens and extracts user information
 * This is executed automatically when a protected route is accessed
 * 
 * Flow:
 * 1. Request comes in with: Authorization: Bearer <token>
 * 2. Passport extracts token from header
 * 3. Token is verified with JWT_SECRET
 * 4. Token payload is decoded: { email, sub (userId), role }
 * 5. validate() method is called with decoded payload
 * 6. User is fetched from database
 * 7. User object is attached to request.user
 * 8. Controller can access user via @CurrentUser() decorator
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      // Extract JWT from Authorization header: "Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // ignoreExpiration: false means reject expired tokens
      // Tokens expire after 7 days (set in auth.module.ts)
      ignoreExpiration: false,
      
      // Secret key used to verify token signature
      // Must match the secret used when creating token in auth.module.ts
      // Using ConfigService ensures we read from the same .env source
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
    });
  }

  /**
   * Validate method - Called AFTER token is verified
   * Receives decoded JWT payload
   * 
   * @param payload - Decoded JWT payload: { email, sub (userId), role }
   * @returns User object (becomes request.user)
   * @throws UnauthorizedException if user not found
   * 
   * Example payload:
   * {
   *   "email": "john@example.com",
   *   "sub": "550e8400-e29b-41d4-a716-446655440000",
   *   "role": "customer",
   *   "iat": 1234567890,  // Issued at timestamp
   *   "exp": 1234987890   // Expiry timestamp
   * }
   */
  async validate(payload: any) {
    // Fetch user from database using ID from token
    // payload.sub contains the user ID ("sub" = subject in JWT terminology)
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      // User was deleted after token was issued
      throw new UnauthorizedException();
    }
    
    // Return user object - this becomes request.user
    // Controllers can access it with @CurrentUser() decorator
    return user;
  }
}
