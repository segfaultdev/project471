import {
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  COD = 'cod',
  CARD = 'card',
  BANK = 'bank',
}

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  image?: string;
}

export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsString()
  couponCode?: string | null;

  @IsNumber()
  shipping: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  total: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}
