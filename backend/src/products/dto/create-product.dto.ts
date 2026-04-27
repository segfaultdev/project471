import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  @IsOptional()
  stock?: number;

  @IsString({ message: 'Category must be a string' })
  @IsOptional()
  category?: string;

  @IsArray({ message: 'Images must be an array' })
  @IsOptional()
  images?: string[];

  @IsString({ message: 'Store ID must be a string' })
  @IsNotEmpty({ message: 'Store ID is required' })
  storeId: string;

  @IsBoolean({ message: 'isAvailable must be a boolean' })
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(0, { message: 'Weight cannot be negative' })
  @IsOptional()
  weight?: number;
}
