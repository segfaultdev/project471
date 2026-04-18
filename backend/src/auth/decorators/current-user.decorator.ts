/**
 * @CurrentUser() Decorator - Extracts authenticated user from request
 * 
 * After JWT token is validated, user object is attached to request.user
 * This decorator provides a convenient way to access it in controllers
 * 
 * Usage:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: User) {
 *     console.log(user.id);        // Access user ID
 *     console.log(user.email);     // Access user email
 *     console.log(user.role);      // Access user role
 *     return user;
 *   }
 * 
 * How it works:
 * 1. JwtAuthGuard validates token
 * 2. JwtStrategy.validate() fetches user from database
 * 3. User object is attached to request.user
 * 4. @CurrentUser() extracts request.user and passes it as parameter
 * 
 * Important: Only works on protected routes (not @Public() routes)
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Create custom parameter decorator
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Get HTTP request from execution context
    const request = ctx.switchToHttp().getRequest();
    
    // Return user object attached by JWT validation
    // This will be null on public routes
    return request.user;
  },
);
