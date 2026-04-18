/**
 * UpdateStoreDto - Data Transfer Object for updating stores
 * All fields are optional (partial update)
 * Uses PartialType to make all CreateStoreDto fields optional
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
