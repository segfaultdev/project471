/**
 * CategoriesModule - Configures everything related to product categories
 * This module:
 * 1. Registers the Category entity with TypeORM (for database operations)
 * 2. Declares the CategoriesController (handles HTTP requests)
 * 3. Provides the CategoriesService (business logic)
 * 4. Exports CategoriesService (so other modules can use it)
 * 5. Imports StoresModule (to verify store ownership)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    // Register Category entity - gives us access to Category database table
    TypeOrmModule.forFeature([Category]),
    // Import StoresModule to verify ownership
    StoresModule,
  ],
  // Declare controller that handles routes
  controllers: [CategoriesController],
  // Provide service for business logic
  providers: [CategoriesService],
  // Export service so other modules can inject and use it
  exports: [CategoriesService],
})
export class CategoriesModule {}
