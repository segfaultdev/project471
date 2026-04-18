/**
 * UpdateProductDto - Data Transfer Object for updating products
 * All fields are optional (partial update)
 * Uses PartialType to make all CreateProductDto fields optional
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
