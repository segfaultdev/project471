import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    StoresModule,
  ],
  controllers: [ProductsController], // Register HTTP routes
  providers: [ProductsService],      // Register services for dependency injection
  exports: [ProductsService],        // Export so other modules can inject ProductsService
})
export class ProductsModule {}
