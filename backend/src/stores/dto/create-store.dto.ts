import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
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

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
