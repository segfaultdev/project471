import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoreFollow } from './entities/store-follow.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreFollow, Product, Order, OrderItem]),
    NotificationsModule,
  ],
  controllers: [StoresController], // Register HTTP routes
  providers: [StoresService], // Register services for dependency injection
  exports: [StoresService], // Export so other modules can inject StoresService
})
export class StoresModule {}
