import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon } from './coupon.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';

@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly couponsService: CouponsService,
    private readonly storesService: StoresService,
  ) {}

  @Roles(UserRole.VENDOR)
  @Post()
  async create(@Request() req, @Body() data: Partial<Coupon>) {
    const store = await this.storesService.findOne(data.storeId || '');
    if (!store || store.ownerId !== req.user.id) {
      throw new ForbiddenException(
        'You can only create coupons for your own stores',
      );
    }

    return this.couponsService.create(data);
  }

  @Roles(UserRole.VENDOR)
  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Public()
  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.couponsService.findByStore(storeId);
  }

  @Public()
  @Get('store/:storeId/code/:code')
  findActiveByStoreAndCode(
    @Param('storeId') storeId: string,
    @Param('code') code: string,
  ) {
    return this.couponsService.findActiveByStoreAndCode(storeId, code);
  }

  @Public()
  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: Partial<Coupon>,
  ) {
    const coupon = await this.couponsService.findOne(id);
    const store = await this.storesService.findOne(coupon.storeId);
    if (!store || store.ownerId !== req.user.id) {
      throw new ForbiddenException(
        'You can only update coupons for your own stores',
      );
    }

    return this.couponsService.update(id, data);
  }

  @Roles(UserRole.VENDOR)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const coupon = await this.couponsService.findOne(id);
    const store = await this.storesService.findOne(coupon.storeId);
    if (!store || store.ownerId !== req.user.id) {
      throw new ForbiddenException(
        'You can only delete coupons for your own stores',
      );
    }

    return this.couponsService.remove(id);
  }
}
