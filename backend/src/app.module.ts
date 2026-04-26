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
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SocialImportModule } from './social-import/social-import.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { NotificationsModule } from './notifications/notifications.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    // ConfigModule - Loads environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Make env variables available everywhere
      envFilePath: '.env', // Path to .env file
    }),

    // TypeOrmModule - Configures DB connection from environment variables
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = (configService.get<string>('DB_TYPE') || 'sqlite').toLowerCase();
        const isProduction = (configService.get<string>('NODE_ENV') || '').toLowerCase() === 'production';
        const synchronize = (configService.get<string>('DB_SYNCHRONIZE') || (!isProduction).toString()) === 'true';
        const logging = (configService.get<string>('DB_LOGGING') || (!isProduction).toString()) === 'true';

        if (dbType === 'postgres') {
          return {
            type: 'postgres' as const,
            host: configService.get<string>('DB_HOST'),
            port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            ssl:
              (configService.get<string>('DB_SSL') || 'false') === 'true'
                ? { rejectUnauthorized: false }
                : false,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize,
            logging,
          };
        }

        return {
          type: 'sqlite' as const,
          database: configService.get<string>('SQLITE_PATH') || 'database.sqlite',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize,
          logging,
        };
      },
    }),

    UsersModule, // User management (CRUD operations)
    AuthModule, // Authentication (login, register, JWT)
    StoresModule, // Store/Vendor management (CRUD operations)
    ProductsModule, // Product catalog (CRUD operations)
    OrdersModule, // Order management (CRUD operations)
    ReviewsModule, // Product reviews and ratings
    NotificationsModule, // Buyer notifications
    CouponsModule, // Seller coupon management
    SocialImportModule, // Controlled demo Facebook/Instagram import lookups
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
