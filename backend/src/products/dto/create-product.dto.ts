/**
 * CreateProductDto - Data Transfer Object for creating products
 * Validates input data before creating a product
 */
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';

export class CreateProductDto {
  // Product name - required
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  // Product description - optional
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  // Product price - required, must be positive number
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  // Stock quantity - optional, defaults to 0
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  @IsOptional()
  stock?: number;

  // Product category ID - optional (UUID of the category)
  @IsString({ message: 'Category ID must be a string' })
  @IsOptional()
  categoryId?: string;

  // Product images - optional array of URLs
  @IsArray({ message: 'Images must be an array' })
  @IsOptional()
  images?: string[];

  // Store ID - required (UUID of the store that owns this product)
  @IsString({ message: 'Store ID must be a string' })
  @IsNotEmpty({ message: 'Store ID is required' })
  storeId: string;

  // Is product available - optional, defaults to true
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  @IsOptional()
  isAvailable?: boolean;

  // Product weight - optional
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(0, { message: 'Weight cannot be negative' })
  @IsOptional()
  weight?: number;
}
