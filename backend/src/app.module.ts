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
import { CategoriesModule } from './categories/categories.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { NotificationsModule } from './notifications/notifications.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = (configService.get<string>('NODE_ENV') || '').toLowerCase() === 'production';
        const synchronize = (configService.get<string>('DB_SYNCHRONIZE') || (!isProduction).toString()) === 'true';
        const logging = (configService.get<string>('DB_LOGGING') || (!isProduction).toString()) === 'true';

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
          entities: [],
          autoLoadEntities: true,
          synchronize,
          logging,
        };
      },
    }),

    UsersModule,
    AuthModule,
    StoresModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    NotificationsModule,
    CouponsModule,
    SocialImportModule,
    CategoriesModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
