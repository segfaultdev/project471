export class CreateOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class CreateOrderDto {
  customerId: string;
  storeId: string;
  items: CreateOrderItemDto[];
  shippingCity?: string;
  shippingArea?: string;
  shippingAddress?: string;
}