/**
 * @Public() Decorator - Marks routes as accessible without authentication
 * 
 * By default, all routes are protected by JWT authentication (set in app.module.ts)
 * Use @Public() decorator to make specific routes accessible without a token
 * 
 * Usage:
 *   @Public()
 *   @Get('hello')
 *   publicRoute() {
 *     return 'Anyone can access this';
 *   }
 * 
 * How it works:
 * 1. @Public() adds metadata with key 'isPublic' and value true to the route
 * 2. JwtAuthGuard checks for this metadata
 * 3. If metadata exists, guard skips authentication
 * 4. If metadata doesn't exist, guard requires JWT token
 */
import { SetMetadata } from '@nestjs/common';

// Metadata key used to mark public routes
export const IS_PUBLIC_KEY = 'isPublic';

// Decorator function that sets metadata
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
