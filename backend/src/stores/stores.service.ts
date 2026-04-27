import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.storesRepository.findOne({
        where: { slug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const baseSlug = this.generateSlug(createStoreDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const store = this.storesRepository.create({
      ...createStoreDto,
      slug,
    });
    return this.storesRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    const stores = await this.storesRepository.find({
      relations: ['owner'], // Include owner information
    });
    
    await this.generateMissingSlugs(stores);
    
    return stores;
  }

  private async generateMissingSlugs(stores: Store[]): Promise<void> {
    for (const store of stores) {
      if (!store.slug) {
        const baseSlug = this.generateSlug(store.name);
        const slug = await this.ensureUniqueSlug(baseSlug, store.id);
        await this.storesRepository.update(store.id, { slug });
        store.slug = slug; // Update in-memory object
      }
    }
  }

  async findOne(id: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { id },
      relations: ['owner'], // Include owner information
    });
  }

  async findBySlug(slug: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { slug },
      relations: ['owner'], // Include owner information
    });
  }

  async findByOwner(ownerId: string): Promise<Store[]> {
    const stores = await this.storesRepository.find({
      where: { ownerId },
      relations: ['owner'],
    });
    
    await this.generateMissingSlugs(stores);
    
    return stores;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store | null> {
    if (updateStoreDto.name) {
      const baseSlug = this.generateSlug(updateStoreDto.name);
      const slug = await this.ensureUniqueSlug(baseSlug, id);
      updateStoreDto = { ...updateStoreDto, slug } as any;
    }

    await this.storesRepository.update(id, updateStoreDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete({ storeId: id });
    
    await this.storesRepository.delete(id);
  }


  async createOrder(createOrderDto: CreateOrderDto, customerId?: string): Promise<Order> {
    const { storeId, customerInfo, items, total } = createOrderDto;

    const order = this.ordersRepository.create({
      storeId,
      customerId: customerId || undefined,
      totalAmount: total,
      status: OrderStatus.PENDING,
      shippingAddress: customerInfo.address,
      shippingCity: customerInfo.city,
      shippingArea: customerInfo.postalCode,
    });

    const savedOrder = await this.ordersRepository.save(order);

    const orderItems = items.map((item) => {
      return this.orderItemsRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.quantity * item.price,
      });
    });

    await this.orderItemsRepository.save(orderItems);

    const createdOrder = await this.findOrderById(savedOrder.id);
    if (!createdOrder) {
      throw new Error('Failed to create order');
    }
    return createdOrder;
  }

  async findOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { customerId },
      relations: ['items', 'items.product', 'store'],
      order: { createdAt: 'DESC' },
    });
  }


  async findAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items', 'items.product', 'store', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrderById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'store', 'customer'],
    });
  }

  async findOrdersByStore(storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { storeId },
      relations: ['items', 'items.product', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.ordersRepository.update(id, { status });
    return this.findOrderById(id);
  }

  async getDailySales(storeId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async getBestSellingProducts(storeId: string, limit: number = 10): Promise<any[]> {
    return this.orderItemsRepository
      .createQueryBuilder('item')
      .select('item.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .innerJoin('item.order', 'order')
      .innerJoin('item.product', 'product')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .groupBy('item.productId')
      .addGroupBy('product.name')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getReturnRate(storeId: string): Promise<number> {
    const totalOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
      })
      .getCount();

    if (totalOrders === 0) return 0;

    const returnedOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.RETURNED })
      .getCount();

    return (returnedOrders / totalOrders) * 100;
  }

  async getStoreStats(storeId: string): Promise<any> {
    const totalOrders = await this.ordersRepository.count({
      where: { storeId },
    });

    const completedOrders = await this.ordersRepository.count({
      where: { storeId, status: OrderStatus.COMPLETED },
    });

    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();

    const returnRate = await this.getReturnRate(storeId);

    return {
      totalOrders,
      completedOrders,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      returnRate: parseFloat(returnRate.toFixed(2)),
    };
  }

  async getOrdersByLocation(storeId: string): Promise<any[]> {
    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.shippingCity', 'city')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.shippingCity IS NOT NULL')
      .groupBy('order.shippingCity')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    const total = orders.reduce((sum, item) => sum + parseInt(item.orderCount), 0);

    return orders.map(item => ({
      city: item.city || 'Unknown',
      orderCount: parseInt(item.orderCount),
      percentage: total > 0 ? ((parseInt(item.orderCount) / total) * 100).toFixed(1) : 0,
    }));
  }
}
