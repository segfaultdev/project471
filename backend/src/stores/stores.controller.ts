/**
 * StoresController - Handles HTTP requests for store operations
 * All routes are prefixed with '/stores'
 * All routes are protected by JWT authentication (global guard)
 *
 * Role-based access:
 * - Create/Update/Delete stores: Only VENDOR role
 * - View stores: All authenticated users
 *
 * All routes start with /stores
 * All routes need JWT token (global guard)
 * 
 * Role-based access:
 * - Create/Update/Delete stores: Only VENDOR role
 * - View stores: All users
 * 
 * Available endpoints:
 * POST   /stores              - Create new store (Vendor only)
 * GET    /stores              - Get all stores
 * GET    /stores/my-stores    - Get stores owned by user
 * GET    /stores/owner/:ownerId - Get stores by owner
 * GET    /stores/slug/:slug   - Get store by slug
 * GET    /stores/:id          - Get store by ID
 * PATCH  /stores/:id          - Update store (Vendor only)
 * DELETE /stores/:id          - Delete store (Vendor only)
 * POST   /stores/orders       - Create order
 * GET    /stores/orders       - Get all orders
 * GET    /stores/orders/:id   - Get order by ID
 * GET    /stores/:storeId/orders - Get orders by store
 * PATCH  /stores/orders/:id/status - Update order status
 * GET    /stores/:storeId/orders/stats/daily - Get daily sales
 * GET    /stores/:storeId/orders/stats/best-sellers - Get best sellers
 * GET    /stores/:storeId/orders/stats/return-rate - Get return rate
 * GET    /stores/:storeId/orders/stats/store - Get store stats
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';

@Controller('stores') // All routes start with /stores
export class StoresController {
  // Inject StoresService to access business logic
  constructor(private readonly storesService: StoresService) {}

  /**
   * POST /stores - Create a new store
   * Only VENDOR can create stores
   * ownerId is set from logged in user
   */
  @Roles(UserRole.VENDOR)
  @Post()
  create(@Request() req, @Body() createStoreDto: CreateStoreDto) {
    // Auto-set ownerId from authenticated user
    return this.storesService.create({
      ...createStoreDto,
      ownerId: req.user.id,
    });
  }

  /**
   * GET /stores - Get all stores
   */
  @Public()
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  /**
   * GET /stores/my-stores - Get stores owned by logged in user
   */
  @Get('my-stores')
  findMyStores(@Request() req) {
    return this.storesService.findByOwner(req.user.id);
  }

  /**
   * GET /stores/owner/:ownerId - Get stores by owner
   */
  @Public()
  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.storesService.findByOwner(ownerId);
  }

  /**
   * GET /stores/slug/:slug - Get store by slug
   */
  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const store = await this.storesService.findBySlug(slug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${slug}" not found`);
    }
    return store;
  }

  /**
   * GET /stores/:id - Get store by ID
   */
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  /**
   * PATCH /stores/:id - Update a store
   * Only VENDOR can update their own stores
   */
  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    // Verify store exists and belongs to the current user
    const store = await this.storesService.findOne(id);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only update your own stores');
    }
    return this.storesService.update(id, updateStoreDto);
  }

  /**
   * DELETE /stores/:id - Delete a store
   * Only VENDOR can delete their own stores
   */
  @Roles(UserRole.VENDOR)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const store = await this.storesService.findOne(id);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only delete your own stores');
    }
    return this.storesService.remove(id);
  }

  // ========== ORDER ENDPOINTS ==========

  /**
   * POST /stores/orders - Create a new order
   */
  @Post('orders')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.storesService.createOrder(createOrderDto);
  }

  /**
   * GET /stores/orders - Get all orders
   */
  @Get('orders')
  findAllOrders() {
    return this.storesService.findAllOrders();
  }

  /**
   * GET /stores/orders/:id - Get order by ID
   */
  @Get('orders/:id')
  findOrderById(@Param('id') id: string) {
    return this.storesService.findOrderById(id);
  }

  /**
   * GET /stores/:storeId/orders - Get orders by store
   */
  @Get(':storeId/orders')
  findOrdersByStore(@Param('storeId') storeId: string) {
    return this.storesService.findOrdersByStore(storeId);
  }

  /**
   * PATCH /stores/orders/:id/status - Update order status
   */
  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.storesService.updateOrderStatus(id, status);
  }

  /**
   * GET /stores/:storeId/orders/stats/daily - Get daily sales
   */
  @Get(':storeId/orders/stats/daily')
  getDailySales(
    @Param('storeId') storeId: string,
    @Query('date') date: string,
  ) {
    const [year, month, day] = (date || '').split('-').map((value) => parseInt(value, 10));
    const parsedDate =
      Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
        ? new Date(year, month - 1, day)
        : new Date(date);

    return this.storesService.getDailySales(storeId, parsedDate);
  }

  /**
   * GET /stores/:storeId/orders/stats/best-sellers - Get best sellers
   */
  @Get(':storeId/orders/stats/best-sellers')
  getBestSellingProducts(
    @Param('storeId') storeId: string,
  ) {
    return this.storesService.getBestSellingProducts(storeId);
  }

  /**
   * GET /stores/:storeId/orders/stats/return-rate - Get return rate
   */
  @Get(':storeId/orders/stats/return-rate')
  getReturnRate(@Param('storeId') storeId: string) {
    return this.storesService.getReturnRate(storeId);
  }

  /**
   * GET /stores/:storeId/orders/stats/store - Get store stats
   */
  @Get(':storeId/orders/stats/store')
  getStoreStats(@Param('storeId') storeId: string) {
    return this.storesService.getStoreStats(storeId);
  }

  /**
   * GET /stores/:storeId/orders/stats/location - Get orders by location
   */
  @Get(':storeId/orders/stats/location')
  getOrdersByLocation(@Param('storeId') storeId: string) {
    return this.storesService.getOrdersByLocation(storeId);
  }
}
