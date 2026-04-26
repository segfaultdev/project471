import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto, customerId: string): Promise<Order> {
    // Verify store exists
    const store = await this.storesRepository.findOne({
      where: { id: createOrderDto.storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const customer = await this.usersRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    const order = this.ordersRepository.create({
      orderNumber,
      store,
      customer,
      customerInfo: createOrderDto.customerInfo,
      items: createOrderDto.items,
      subtotal: createOrderDto.subtotal,
      shipping: createOrderDto.shipping,
      tax: createOrderDto.tax,
      total: createOrderDto.total,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
      notes: createOrderDto.notes,
    });

    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['store', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { store: { id: storeId } },
      relations: ['store', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['store', 'customer'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}
