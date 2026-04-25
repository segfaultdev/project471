import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  create(orderData: Partial<Order>) {
    const order = this.ordersRepository.create(orderData);
    return this.ordersRepository.save(order);
  }

  findAll() {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByStore(storeId: string) {
    return this.ordersRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }
}