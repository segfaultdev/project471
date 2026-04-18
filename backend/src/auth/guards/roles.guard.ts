/**
 * RolesGuard - Authorization guard that checks user roles
 * Works after JWT authentication to verify if user has required role
 * 
 * Flow:
 * 1. JwtAuthGuard authenticates user (validates JWT token)
 * 2. RolesGuard checks if authenticated user has required role
 * 3. If role matches, allow access; otherwise return 403 Forbidden
 * 
 * Similar to Express middleware:
 * app.get('/route', authenticate, checkRole('vendor'), handler)
 */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector helps read metadata set by decorators
  constructor(private reflector: Reflector) {}

  /**
   * canActivate - Determines if request should be allowed
   * @param context - Execution context containing request info
   * @returns boolean - true to allow, false/throw to deny
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    // Checks both handler (method) and class (controller) level
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Method decorator
      context.getClass(),   // Class decorator
    ]);

    // If no @Roles() decorator present, allow access
    // This means route doesn't require specific role
    if (!requiredRoles) {
      return true;
    }

    // Get user from request (added by JwtAuthGuard after authentication)
    const { user } = context.switchToHttp().getRequest();

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      // User doesn't have required role - deny access
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`
      );
    }

    return true;
  }
}
