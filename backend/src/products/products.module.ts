/**
 * ProductsModule - Configures everything related to products
 * This module:
 * 1. Registers the Product entity with TypeORM (for database operations)
 * 2. Declares the ProductsController (handles HTTP requests)
 * 3. Provides the ProductsService (business logic)
 * 4. Exports ProductsService (so other modules can use it)
 * 5. Imports StoresModule (to verify store ownership)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    // Register Product entity - gives us access to Product database table
    TypeOrmModule.forFeature([Product]),
    // Import StoresModule to access StoresService for ownership verification
    StoresModule,
  ],
  controllers: [ProductsController], // Register HTTP routes
  providers: [ProductsService],      // Register services for dependency injection
  exports: [ProductsService],        // Export so other modules can inject ProductsService
})
export class ProductsModule {}
