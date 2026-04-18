/**
 * RegisterDto - Data Transfer Object for user registration
 * Identical to CreateUserDto but used in auth context
 * Validates all required fields + password strength
 * 
 * Validation rules:
 * - Email: Valid format, required
 * - Password: Min 6 characters, required
 * - First name: Required
 * - Last name: Required
 * - Role: Optional (defaults to 'customer'), must be valid enum value
 * 
 * Example valid request:
 * {
 *   "email": "john@example.com",
 *   "password": "securepass123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "role": "customer"  // optional - must be: customer, vendor, admin, or moderator
 * }
 * 
 * Password Security:
 * - Must be at least 6 characters (enforced by @MinLength)
 * - Automatically hashed with bcrypt before storage
 * - Never stored or returned as plain text
 * 
 * Role Validation:
 * - Must match UserRole enum values
 * - Invalid roles (e.g., "superuser") will be rejected with 400 error
 */
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEnum(UserRole, { 
    message: 'Role must be one of: customer, vendor, admin, moderator' 
  })
  @IsOptional() // Optional - defaults to 'customer' in database
  role?: UserRole;
}
