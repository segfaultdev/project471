/**
 * StoresService - Business logic for store management
 * Handles all database operations for stores (CRUD)
 */
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
    // Inject TypeORM repository for Store entity
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    // Inject TypeORM repository for Product entity to manage cascade deletion
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    // Inject TypeORM repository for Order entity
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    // Inject TypeORM repository for OrderItem entity
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  /**
   * Generate a URL-friendly slug from store name
   * @param name - Store name
   * @returns string - URL-safe slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Ensure slug is unique by appending number if needed
   * @param baseSlug - Base slug to check
   * @param excludeId - Store ID to exclude from check (for updates)
   * @returns Promise<string> - Unique slug
   */
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

  /**
   * Create a new store
   * @param createStoreDto - Store data to create
   * @returns Promise<Store> - The created store
   * SQL: INSERT INTO stores (...) VALUES (...)
   */
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    // Generate unique slug from store name
    const baseSlug = this.generateSlug(createStoreDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const store = this.storesRepository.create({
      ...createStoreDto,
      slug,
    });
    return this.storesRepository.save(store);
  }

  /**
   * Get all stores from database
   * @returns Promise<Store[]> - Array of all stores
   * SQL: SELECT * FROM stores
   */
  async findAll(): Promise<Store[]> {
    const stores = await this.storesRepository.find({
      relations: ['owner'], // Include owner information
    });
    
    // Auto-generate slugs for existing stores that don't have them
    await this.generateMissingSlugs(stores);
    
    return stores;
  }

  /**
   * Generate slugs for stores that don't have them
   * @param stores - Array of stores to check
   */
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

  /**
   * Find a single store by ID
   * @param id - Store's UUID
   * @returns Promise<Store | null> - Store object or null if not found
   * SQL: SELECT * FROM stores WHERE id = ?
   */
  async findOne(id: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { id },
      relations: ['owner'], // Include owner information
    });
  }

  /**
   * Find a single store by slug
   * @param slug - Store's unique slug
   * @returns Promise<Store | null> - Store object or null if not found
   * SQL: SELECT * FROM stores WHERE slug = ?
   */
  async findBySlug(slug: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { slug },
      relations: ['owner'], // Include owner information
    });
  }

  /**
   * Find stores by owner ID
   * @param ownerId - User's UUID
   * @returns Promise<Store[]> - Array of stores owned by user
   * SQL: SELECT * FROM stores WHERE ownerId = ?
   */
  async findByOwner(ownerId: string): Promise<Store[]> {
    const stores = await this.storesRepository.find({
      where: { ownerId },
      relations: ['owner'],
    });
    
    // Auto-generate slugs for existing stores that don't have them
    await this.generateMissingSlugs(stores);
    
    return stores;
  }

  /**
   * Update an existing store
   * @param id - Store's UUID
   * @param updateStoreDto - Fields to update
   * @returns Promise<Store | null> - Updated store or null if not found
   * SQL: UPDATE stores SET ... WHERE id = ?
   */
  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store | null> {
    // If name is being updated, regenerate slug
    if (updateStoreDto.name) {
      const baseSlug = this.generateSlug(updateStoreDto.name);
      const slug = await this.ensureUniqueSlug(baseSlug, id);
      updateStoreDto = { ...updateStoreDto, slug } as any;
    }

    await this.storesRepository.update(id, updateStoreDto);
    return this.findOne(id);
  }

  /**
   * Delete a store from database
   * First deletes all products associated with the store to avoid foreign key constraint violation
   * @param id - Store's UUID
   * @returns Promise<void>
   * SQL: DELETE FROM products WHERE storeId = ?; DELETE FROM stores WHERE id = ?
   */
  async remove(id: string): Promise<void> {
    // First, delete all products associated with this store
    await this.productsRepository.delete({ storeId: id });
    
    // Then delete the store
    await this.storesRepository.delete(id);
  }

  // ========== ORDER METHODS ==========

  /**
   * Create a new order
   */
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, storeId, items, shippingCity, shippingArea, shippingAddress } = createOrderDto;

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = this.ordersRepository.create({
      customerId,
      storeId,
      totalAmount,
      status: OrderStatus.PENDING,
      shippingCity,
      shippingArea,
      shippingAddress,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order items
    const orderItems = items.map((item) => {
      return this.orderItemsRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      });
    });

    await this.orderItemsRepository.save(orderItems);

    const createdOrder = await this.findOrderById(savedOrder.id);
    if (!createdOrder) {
      throw new Error('Failed to create order');
    }
    return createdOrder;
  }

  /**
   * Get all orders
   */
  async findAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items', 'items.product', 'store', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get order by ID
   */
  async findOrderById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'store', 'customer'],
    });
  }

  /**
   * Get orders by store
   */
  async findOrdersByStore(storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { storeId },
      relations: ['items', 'items.product', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.ordersRepository.update(id, { status });
    return this.findOrderById(id);
  }

  /**
   * Get daily sales for a store
   */
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

  /**
   * Get best selling products for a store
   */
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

  /**
   * Get return rate for a store
   */
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

  /**
   * Get store statistics
   */
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

  /**
   * Get orders by location (city)
   */
  async getOrdersByLocation(storeId: string): Promise<any[]> {
    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.shippingCity', 'city')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.shippingCity IS NOT NULL')
      .groupBy('order.shippingCity')
      .orderBy('orderCount', 'DESC')
      .getRawMany();

    // Calculate total for percentage
    const total = orders.reduce((sum, item) => sum + parseInt(item.orderCount), 0);

    return orders.map(item => ({
      city: item.city || 'Unknown',
      orderCount: parseInt(item.orderCount),
      percentage: total > 0 ? ((parseInt(item.orderCount) / total) * 100).toFixed(1) : 0,
    }));
  }
}
