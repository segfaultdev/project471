import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { StoresService } from '../stores/stores.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
    private readonly storesService: StoresService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(couponData: Partial<Coupon>) {
    const coupon = this.couponsRepository.create(couponData);
    const savedCoupon = await this.couponsRepository.save(coupon);

    if (savedCoupon.storeId && savedCoupon.isActive !== false) {
      const followerIds = await this.storesService.findFollowerIds(
        savedCoupon.storeId,
      );

      await Promise.all(
        followerIds.map((buyerId) =>
          this.notificationsService.createDiscountNotification(
            buyerId,
            savedCoupon.code,
          ),
        ),
      );
    }

    return savedCoupon;
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

  findByStores(storeIds: string[]) {
    if (storeIds.length === 0) {
      return [];
    }

    return this.couponsRepository
      .createQueryBuilder('coupon')
      .where('coupon.storeId IN (:...storeIds)', { storeIds })
      .orderBy('coupon.createdAt', 'DESC')
      .getMany();
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

  async findOne(id: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findActiveByStoreAndCode(storeId: string, code: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { storeId, code },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundException(
        'Coupon not found or inactive for this store',
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new NotFoundException('Coupon has expired');
    }

    return coupon;
  }

  async update(id: string, couponData: Partial<Coupon>) {
    const coupon = await this.findOne(id);

    Object.assign(coupon, couponData);
    return this.couponsRepository.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);

    return this.couponsRepository.remove(coupon);
  }
}
