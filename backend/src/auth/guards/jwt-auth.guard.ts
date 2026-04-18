/**
 * JwtAuthGuard - Protects routes by checking for valid JWT token
 * Applied globally in app.module.ts - ALL routes are protected by default
 * Routes marked with @Public() decorator skip this guard
 * 
 * Flow:
 * 1. Request comes in to any route
 * 2. Guard checks if route has @Public() decorator
 * 3. If public → Allow access immediately
 * 4. If protected → Check for valid JWT token in Authorization header
 * 5. If token valid → Extract user and continue to controller
 * 6. If token invalid/missing → Throw 401 Unauthorized
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if request can proceed
   * 
   * @param context - Execution context with request info
   * @returns boolean - true = allow access, false = deny access
   * 
   * Process:
   * 1. Check for @Public() decorator on route
   * 2. If @Public() exists → return true (skip authentication)
   * 3. If no @Public() → call super.canActivate() to validate JWT
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Use Reflector to check if @Public() decorator is present
    // Checks both the method (e.g., @Get()) and class (e.g., @Controller())
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),  // Check method decorator: @Public() @Get('login')
      context.getClass(),    // Check class decorator: @Public() @Controller()
    ]);
    
    if (isPublic) {
      // Route is public - skip authentication
      return true;
    }
    
    // Route is protected - validate JWT token
    // super.canActivate() will:
    // 1. Extract token from Authorization header
    // 2. Verify token with JWT_SECRET
    // 3. Call JwtStrategy.validate()
    // 4. Attach user to request.user
    return super.canActivate(context);
  }
}
