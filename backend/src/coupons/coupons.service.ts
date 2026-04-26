import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
  ) {}

  create(couponData: Partial<Coupon>) {
    const coupon = this.couponsRepository.create(couponData);
    return this.couponsRepository.save(coupon);
  }

  findAll() {
    return this.couponsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByStore(storeId: string) {
    return this.couponsRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { code },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async update(id: string, couponData: Partial<Coupon>) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    Object.assign(coupon, couponData);
    return this.couponsRepository.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return this.couponsRepository.remove(coupon);
  }
}