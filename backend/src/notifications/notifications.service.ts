import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  create(data: Partial<Notification>) {
    const notification = this.notificationsRepository.create(data);
    return this.notificationsRepository.save(notification);
  }

  createDiscountNotification(buyerId: string, couponCode: string) {
    return this.create({
      buyerId,
      type: NotificationType.DISCOUNT,
      title: 'New Discount Available',
      message: `A new discount coupon is available: ${couponCode}`,
    });
  }

  createStockUpdateNotification(buyerId: string, productName: string) {
    return this.create({
      buyerId,
      type: NotificationType.STOCK_UPDATE,
      title: 'Product Stock Updated',
      message: `${productName} stock has been updated.`,
    });
  }

  findAll() {
    return this.notificationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findByBuyer(buyerId: string) {
    return this.notificationsRepository.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async remove(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.notificationsRepository.remove(notification);
  }
}