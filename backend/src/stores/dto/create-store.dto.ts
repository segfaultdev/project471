/**
 * CreateStoreDto - Data Transfer Object for creating stores
 * Validates input data before creating a store
 */
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateStoreDto {
  // Store name - required
  @IsString({ message: 'Store name must be a string' })
  @IsNotEmpty({ message: 'Store name is required' })
  name: string;

  // Store description - optional
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  // Owner ID - optional (automatically set from authenticated user)
  // If provided, it will be overridden by the authenticated user's ID
  @IsString({ message: 'Owner ID must be a string' })
  @IsOptional()
  ownerId?: string;

  // Store address - optional
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address?: string;

  // Store phone - optional
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  // Store email - optional but must be valid email format
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  // Store logo URL - optional
  @IsString({ message: 'Logo must be a string' })
  @IsOptional()
  logo?: string;

  // Store banner/cover image URL - optional
  @IsString({ message: 'Banner must be a string' })
  @IsOptional()
  banner?: string;

  // Store slug - URL-friendly identifier, optional
  @IsString({ message: 'Slug must be a string' })
  @IsOptional()
  slug?: string;

  // Store rating - optional, between 0 and 5
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  @IsOptional()
  rating?: number;

  // Delivery days - optional, must be positive
  @IsNumber({}, { message: 'Delivery days must be a number' })
  @Min(1, { message: 'Delivery days must be at least 1' })
  @IsOptional()
  deliveryDays?: number;

  // Is store active - optional, defaults to true
  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
