import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Product, Order, OrderItem])
  ],
  controllers: [StoresController], // Register HTTP routes
  providers: [StoresService],      // Register services for dependency injection
  exports: [StoresService],        // Export so other modules can inject StoresService
})
export class StoresModule {}
