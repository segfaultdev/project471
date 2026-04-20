/**
 * DTO for creating order items
 */
export class CreateOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * DTO for creating a new order
 */
export class CreateOrderDto {
  customerId: string;
  storeId: string;
  items: CreateOrderItemDto[];
  shippingCity?: string;
  shippingArea?: string;
  shippingAddress?: string;
}