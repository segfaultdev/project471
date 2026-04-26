/**
 * CreateStoreDto - Data Transfer Object for creating stores
 * Validates input data before creating a store
 */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';

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

  // Store category - optional (e.g., 'Electronics', 'Clothing', 'Food')
  @IsString({ message: 'Category must be a string' })
  @IsOptional()
  category?: string;

  // Store social link - optional (Facebook, Instagram, etc.)
  @IsString({ message: 'Social link must be a string' })
  @IsOptional()
  socialLink?: string;

  // Is store active - optional, defaults to true
  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
