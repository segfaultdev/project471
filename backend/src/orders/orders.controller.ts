import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() body: any) {
    return this.ordersService.create(body);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.ordersService.findByStore(storeId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}