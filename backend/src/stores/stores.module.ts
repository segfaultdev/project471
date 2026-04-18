/**
 * StoresModule - Configures everything related to stores
 * This module:
 * 1. Registers the Store entity with TypeORM (for database operations)
 * 2. Declares the StoresController (handles HTTP requests)
 * 3. Provides the StoresService (business logic)
 * 4. Exports StoresService (so other modules can use it)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';

@Module({
  imports: [
    // Register Store and Product entities - needed for cascade deletion
    TypeOrmModule.forFeature([Store, Product])
  ],
  controllers: [StoresController], // Register HTTP routes
  providers: [StoresService],      // Register services for dependency injection
  exports: [StoresService],        // Export so other modules can inject StoresService
})
export class StoresModule {}
