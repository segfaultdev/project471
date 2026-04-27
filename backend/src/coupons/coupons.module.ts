import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { Coupon } from './coupon.entity';
import { StoresModule } from '../stores/stores.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon]),
    StoresModule,
    NotificationsModule,
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
