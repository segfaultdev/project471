import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Store } from '../stores/entities/store.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Verify store exists
    const store = await this.storesRepository.findOne({
      where: { id: createOrderDto.storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    const order = this.ordersRepository.create({
      orderNumber,
      store,
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

  async findByCustomer(customerEmail: string): Promise<Order[]> {
    return this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.store', 'store')
      .where("json_extract(order.customerInfo, '$.email') = :email", { email: customerEmail })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
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
    await this.ordersRepository.update(id, { status });
    return { ...order, status };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}
