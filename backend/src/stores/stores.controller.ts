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
  constructor(private readonly storesService: StoresService) {}

  @Roles(UserRole.VENDOR)
  @Post()
  create(@Request() req, @Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create({
      ...createStoreDto,
      ownerId: req.user.id,
    });
  }

  @Public()
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @Get('my-stores')
  findMyStores(@Request() req) {
    return this.storesService.findByOwner(req.user.id);
  }

  @Public()
  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.storesService.findByOwner(ownerId);
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const store = await this.storesService.findBySlug(slug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${slug}" not found`);
    }
    return store;
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    const store = await this.storesService.findOne(id);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only update your own stores');
    }
    return this.storesService.update(id, updateStoreDto);
  }

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


  @Post('orders')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.storesService.createOrder(createOrderDto);
  }

  @Get('orders')
  findAllOrders() {
    return this.storesService.findAllOrders();
  }

  @Get('orders/:id')
  findOrderById(@Param('id') id: string) {
    return this.storesService.findOrderById(id);
  }

  @Get(':storeId/orders')
  findOrdersByStore(@Param('storeId') storeId: string) {
    return this.storesService.findOrdersByStore(storeId);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.storesService.updateOrderStatus(id, status);
  }

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

  @Get(':storeId/orders/stats/best-sellers')
  getBestSellingProducts(
    @Param('storeId') storeId: string,
  ) {
    return this.storesService.getBestSellingProducts(storeId);
  }

  @Get(':storeId/orders/stats/return-rate')
  getReturnRate(@Param('storeId') storeId: string) {
    return this.storesService.getReturnRate(storeId);
  }

  @Get(':storeId/orders/stats/store')
  getStoreStats(@Param('storeId') storeId: string) {
    return this.storesService.getStoreStats(storeId);
  }

  @Get(':storeId/orders/stats/location')
  getOrdersByLocation(@Param('storeId') storeId: string) {
    return this.storesService.getOrdersByLocation(storeId);
  }
}
