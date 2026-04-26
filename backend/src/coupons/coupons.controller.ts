import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon } from './coupon.entity';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  create(@Body() data: Partial<Coupon>) {
    return this.couponsService.create(data);
  }

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.couponsService.findByStore(storeId);
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Coupon>) {
    return this.couponsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}