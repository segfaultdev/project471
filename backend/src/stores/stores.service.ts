/**
 * StoresService - Business logic for store management
 * Handles all database operations for stores (CRUD)
 */
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Order, OrderStatus, PaymentMethod } from '../orders/order.entity';
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
    const {
      storeId,
      items,
      shippingCity,
      shippingArea,
      shippingAddress,
    } = createOrderDto;

    const store = await this.storesRepository.findOne({
      where: { id: storeId },
    });
    if (!store) {
      throw new ConflictException('Store not found');
    }

    const products = await this.productsRepository.find({
      where: { id: In(items.map((item) => item.productId)) },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const order = this.ordersRepository.create({
      orderNumber: this.generateOrderNumber(),
      store,
      customerInfo: {
        firstName: 'Store',
        lastName: 'Order',
        email: '',
        phone: '',
        address: [shippingAddress, shippingArea].filter(Boolean).join(', '),
        city: shippingCity ?? '',
        postalCode: '',
      },
      items: items.map((item) => ({
        productId: item.productId,
        name: productsById.get(item.productId)?.name ?? item.productId,
        price: item.unitPrice,
        quantity: item.quantity,
        image: productsById.get(item.productId)?.images?.[0],
      })),
      subtotal,
      shipping: 0,
      tax: 0,
      total: subtotal,
      paymentMethod: PaymentMethod.COD,
      status: OrderStatus.PENDING,
      notes: 'Created via /stores/orders compatibility endpoint',
    });

    return this.ordersRepository.save(order);
  }

  /**
   * Get all orders
   */
  async findAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['store', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get order by ID
   */
  async findOrderById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['store', 'customer'],
    });
  }

  /**
   * Get orders by store
   */
  async findOrdersByStore(storeId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { store: { id: storeId } },
      relations: ['store', 'customer'],
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
      .leftJoin('order.store', 'store')
      .select('SUM(order.total)', 'total')
      .where('store.id = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.CONFIRMED })
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
    const orders = await this.ordersRepository.find({
      where: {
        store: { id: storeId },
        status: OrderStatus.CONFIRMED,
      },
      relations: ['store'],
    });

    const aggregated = new Map<
      string,
      { productId: string; productName: string; totalQuantity: number; totalRevenue: number }
    >();

    for (const order of orders) {
      for (const item of order.items ?? []) {
        const current = aggregated.get(item.productId) ?? {
          productId: item.productId,
          productName: item.name || item.productId,
          totalQuantity: 0,
          totalRevenue: 0,
        };

        current.totalQuantity += Number(item.quantity ?? 0);
        current.totalRevenue += Number(item.price ?? 0) * Number(item.quantity ?? 0);
        aggregated.set(item.productId, current);
      }
    }

    return Array.from(aggregated.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  /**
   * Get return rate for a store
   */
  async getReturnRate(storeId: string): Promise<number> {
    const totalOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.store', 'store')
      .where('store.id = :storeId', { storeId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      })
      .getCount();

    if (totalOrders === 0) return 0;

    const returnedOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.store', 'store')
      .where('store.id = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.CANCELLED })
      .getCount();

    return (returnedOrders / totalOrders) * 100;
  }

  /**
   * Get store statistics
   */
  async getStoreStats(storeId: string): Promise<any> {
    const totalOrders = await this.ordersRepository.count({
      where: { store: { id: storeId } },
    });

    const completedOrders = await this.ordersRepository.count({
      where: { store: { id: storeId }, status: OrderStatus.CONFIRMED },
    });

    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoin('order.store', 'store')
      .select('SUM(order.total)', 'total')
      .where('store.id = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.CONFIRMED })
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
      .leftJoin('order.store', 'store')
      .select("json_extract(order.customerInfo, '$.city')", 'city')
      .addSelect('COUNT(*)', 'orderCount')
      .where('store.id = :storeId', { storeId })
      .andWhere("json_extract(order.customerInfo, '$.city') IS NOT NULL")
      .groupBy("json_extract(order.customerInfo, '$.city')")
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

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}
