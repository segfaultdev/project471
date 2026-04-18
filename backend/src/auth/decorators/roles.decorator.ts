/**
 * Roles Decorator - Marks routes that require specific user roles
 * 
 * Usage in controllers:
 * @Roles(UserRole.VENDOR, UserRole.ADMIN)
 * @Post()
 * create() { ... }
 * 
 * This decorator sets metadata that the RolesGuard reads to check authorization
 * Similar to Express middleware: app.post('/products', checkRole('vendor'), ...)
 */
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// Metadata key used by RolesGuard to read required roles
export const ROLES_KEY = 'roles';

/**
 * @Roles decorator - Specifies which user roles can access a route
 * @param roles - One or more UserRole values
 * @returns Decorator function
 * 
 * Example:
 * @Roles(UserRole.VENDOR) - Only vendors can access
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR) - Admins or moderators can access
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
