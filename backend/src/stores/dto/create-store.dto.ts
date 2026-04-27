import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateStoreDto {
  @IsString({ message: 'Store name must be a string' })
  @IsNotEmpty({ message: 'Store name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Owner ID must be a string' })
  @IsOptional()
  ownerId?: string;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Logo must be a string' })
  @IsOptional()
  logo?: string;

  @IsString({ message: 'Banner must be a string' })
  @IsOptional()
  banner?: string;

  @IsString({ message: 'Slug must be a string' })
  @IsOptional()
  slug?: string;

  @IsString({ message: 'Category must be a string' })
  @IsOptional()
  category?: string;

  @IsString({ message: 'Social link must be a string' })
  @IsOptional()
  socialLink?: string;

  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  @IsOptional()
  rating?: number;

  @IsNumber({}, { message: 'Delivery days must be a number' })
  @Min(1, { message: 'Delivery days must be at least 1' })
  @IsOptional()
  deliveryDays?: number;
  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
