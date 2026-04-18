/**
 * CreateUserDto - Data Transfer Object for creating users
 * Defines what data is required and validates it automatically
 * 
 * Validation rules are enforced BEFORE the controller method runs
 * If validation fails, returns 400 Bad Request with error details
 * 
 * Example valid request:
 * {
 *   "email": "john@example.com",
 *   "password": "password123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "role": "customer"  // optional - must be: customer, vendor, admin, or moderator
 * }
 * 
 * Example invalid request (will be rejected):
 * {
 *   "email": "invalid-email",     // Not a valid email format
 *   "password": "123",             // Too short (< 6 characters)
 *   "firstName": "",              // Cannot be empty
 *   "role": "superuser"           // Invalid role (not in enum)
 * }
 */
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  // Email field - must be valid email format and not empty
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  // Password field - must be string, at least 6 chars, not empty
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  // First name - must be string and not empty
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  // Last name - must be string and not empty
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  // Role - optional field, defaults to 'customer' in database
  // Must be one of: 'customer', 'vendor', 'admin', 'moderator'
  // @IsEnum validates against UserRole enum values
  @IsEnum(UserRole, { 
    message: 'Role must be one of: customer, vendor, admin, moderator' 
  })
  @IsOptional() // This field is optional, can be omitted from request
  role?: UserRole;
}
