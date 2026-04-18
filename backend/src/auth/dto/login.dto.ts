/**
 * LoginDto - Data Transfer Object for user login
 * Validates email and password format before authentication
 * 
 * Validation rules:
 * - Email must be valid email format
 * - Both fields are required (cannot be empty)
 * 
 * Example valid request:
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * Example invalid request (will be rejected):
 * {
 *   "email": "not-an-email",  // Invalid email format
 *   "password": ""            // Empty password
 * }
 */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Email - must be valid email format
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  // Password - any non-empty string
  // No MinLength here because we're just logging in
  // (password was already validated during registration)
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
