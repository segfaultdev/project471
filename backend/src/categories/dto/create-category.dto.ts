/**
 * CreateCategoryDto - Data Transfer Object for creating new categories
 * Validates and shapes incoming data for category creation
 */
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  // Category name - required field
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  // Category description - optional field
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  // Store ID - required field (UUID of the store that owns this category)
  @IsString({ message: 'Store ID must be a string' })
  @IsNotEmpty({ message: 'Store ID is required' })
  storeId: string;
}
