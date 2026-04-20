/**
 * AppModule - Root module of the application
 * Configures:
 * 1. Environment variables (ConfigModule)
 * 2. Database connection (TypeOrmModule)
 * 3. Feature modules (UsersModule, AuthModule, StoresModule, ProductsModule)
 * 4. Global authentication guard (JwtAuthGuard)
 *
 * This is the entry point that ties everything together
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';
import { PaymentModule } from './payment/payment.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    // ConfigModule - Loads environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Make env variables available everywhere
      envFilePath: '.env', // Path to .env file
    }),

    // TypeOrmModule - Configures SQLite database connection for local development
    TypeOrmModule.forRoot({
      type: 'sqlite', // Database type
      database: 'database.sqlite', // SQLite file
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Auto-discover all entities
      synchronize: true, // Auto-sync schema
      logging: true, // Log queries
    }),

    // Feature Modules
    UsersModule, // User management (CRUD operations)
    AuthModule, // Authentication (login, register, JWT)
    StoresModule, // Store/Vendor management (CRUD operations)
    ProductsModule, // Product catalog (CRUD operations)
    OrdersModule, // Order management (CRUD operations)
    CartModule, // Shopping cart management
    CategoriesModule, // Product categories and subcategories
    PaymentModule, // Payment processing (fake gateway for testing)
  ],

  controllers: [AppController], // Root controller

  providers: [
    AppService,

    // Global JWT Authentication Guard
    // This makes ALL routes protected by default
    // Use @Public() decorator to make routes accessible without token
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global Roles Authorization Guard
    // Checks if authenticated user has required role
    // Use @Roles(UserRole.VENDOR) decorator on routes that need specific roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
