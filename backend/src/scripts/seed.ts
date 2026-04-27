import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Coupon, DiscountType } from '../coupons/coupon.entity';
import { Order, OrderStatus } from '../stores/entities/order.entity';
import { OrderItem } from '../stores/entities/order-item.entity';

function buildDataSource(): DataSource {
  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
  const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  const synchronize = (process.env.DB_SYNCHRONIZE || (!isProduction).toString()) === 'true';
  const logging = (process.env.DB_LOGGING || (!isProduction).toString()) === 'true';

  if (dbType === 'postgres') {
    return new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      entities: [User, Store, Product, Coupon, Order, OrderItem],
      synchronize,
      logging,
    });
  }

  return new DataSource({
    type: 'sqlite',
    database: process.env.SQLITE_PATH || 'database.sqlite',
    entities: [User, Store, Product, Coupon, Order, OrderItem],
    synchronize,
    logging,
  });
}

async function seed() {
  const dataSource = buildDataSource();
  await dataSource.initialize();

  try {
    const userRepo = dataSource.getRepository(User);
    const storeRepo = dataSource.getRepository(Store);
    const productRepo = dataSource.getRepository(Product);
    const couponRepo = dataSource.getRepository(Coupon);
    const orderRepo = dataSource.getRepository(Order);
    const orderItemRepo = dataSource.getRepository(OrderItem);

    const vendorEmail = 'vendor.seed@ecom471.local';
    const customerEmail = 'customer.seed@ecom471.local';
    const seededPassword = await bcrypt.hash('SeedPass123!', 10);

    let vendor = await userRepo.findOne({ where: { email: vendorEmail } });
    if (!vendor) {
      vendor = userRepo.create({
        email: vendorEmail,
        password: seededPassword,
        firstName: 'Seed',
        lastName: 'Vendor',
        role: UserRole.VENDOR,
      });
      vendor = await userRepo.save(vendor);
      console.log('Created vendor user');
    } else {
      console.log('Vendor user already exists');
    }

    let customer = await userRepo.findOne({ where: { email: customerEmail } });
    if (!customer) {
      customer = userRepo.create({
        email: customerEmail,
        password: seededPassword,
        firstName: 'Seed',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
      });
      customer = await userRepo.save(customer);
      console.log('Created customer user');
    } else {
      console.log('Customer user already exists');
    }

    let store = await storeRepo.findOne({ where: { slug: 'seed-store' } });
    if (!store) {
      store = storeRepo.create({
        name: 'Seed Store',
        slug: 'seed-store',
        description: 'Seeded demo store',
        ownerId: vendor.id,
        email: vendor.email,
        phone: '+10000000000',
        address: 'Seed Address',
        isActive: true,
      });
      store = await storeRepo.save(store);
      console.log('Created seed store');
    } else {
      console.log('Seed store already exists');
    }

    const vendorUsers = await userRepo.find({ where: { role: UserRole.VENDOR } });
    for (const vendorUser of vendorUsers) {
      const existingVendorStores = await storeRepo.count({
        where: { ownerId: vendorUser.id },
      });

      if (existingVendorStores > 0) {
        continue;
      }

      const vendorSlug = `seed-${vendorUser.id.slice(0, 8)}`;
      const vendorStore = storeRepo.create({
        name: `${vendorUser.firstName || 'Vendor'} Store`,
        slug: vendorSlug,
        description: 'Auto-created store for analytics seeding',
        ownerId: vendorUser.id,
        email: vendorUser.email,
        phone: '+10000000000',
        address: 'Seed Address',
        isActive: true,
      });
      await storeRepo.save(vendorStore);
      console.log(`Created store for vendor: ${vendorUser.email}`);
    }

    const productsToSeed = [
      {
        name: 'Seed Product A',
        description: 'Demo seeded product A',
        price: 19.99,
        stock: 30,
        category: 'General',
        images: [],
      },
      {
        name: 'Seed Product B',
        description: 'Demo seeded product B',
        price: 49.5,
        stock: 12,
        category: 'General',
        images: [],
      },
    ];

    for (const productData of productsToSeed) {
      const existing = await productRepo.findOne({
        where: {
          name: productData.name,
          storeId: store.id,
        },
      });

      if (!existing) {
        const product = productRepo.create({
          ...productData,
          storeId: store.id,
          isAvailable: true,
        });
        await productRepo.save(product);
        console.log(`Created product: ${productData.name}`);
      } else {
        console.log(`Product already exists: ${productData.name}`);
      }
    }

    const couponCode = 'SEED10';
    const existingCoupon = await couponRepo.findOne({ where: { code: couponCode } });
    if (!existingCoupon) {
      const coupon = couponRepo.create({
        code: couponCode,
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        storeId: store.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
      await couponRepo.save(coupon);
      console.log('Created coupon: SEED10');
    } else {
      console.log('Coupon already exists: SEED10');
    }

    const minimumAnalyticsOrders = 25;
    const allStores = await storeRepo.find();
    const cities = ['Dhaka', 'Chittagong', 'Khulna', 'Sylhet', 'Rajshahi'];

    for (const currentStore of allStores) {
      const existingAnalyticsOrders = await orderRepo.count({
        where: { storeId: currentStore.id },
      });

      if (existingAnalyticsOrders >= minimumAnalyticsOrders) {
        console.log(
          `Analytics seed orders already satisfy minimum for ${currentStore.slug} (${existingAnalyticsOrders}/${minimumAnalyticsOrders})`,
        );
        continue;
      }

      const ordersToCreate = minimumAnalyticsOrders - existingAnalyticsOrders;
      let productsForStore = await productRepo.find({
        where: { storeId: currentStore.id },
      });

      if (productsForStore.length === 0) {
        const fallbackProduct = productRepo.create({
          name: `Analytics Product ${currentStore.name}`,
          description: 'Auto-created product for analytics seeding',
          price: 29.99,
          stock: 100,
          category: 'General',
          images: [],
          storeId: currentStore.id,
          isAvailable: true,
        });
        await productRepo.save(fallbackProduct);
        productsForStore = [fallbackProduct];
        console.log(`Created fallback product for store: ${currentStore.slug}`);
      }

      for (let i = 0; i < ordersToCreate; i++) {
        const primaryProduct = productsForStore[i % productsForStore.length];
        const secondaryProduct = productsForStore[(i + 1) % productsForStore.length];

        const primaryQuantity = (i % 3) + 1;
        const secondaryQuantity = i % 2 === 0 ? 1 : 0;

        const primarySubtotal = Number(primaryProduct.price) * primaryQuantity;
        const secondarySubtotal = Number(secondaryProduct.price) * secondaryQuantity;
        const totalAmount = Number((primarySubtotal + secondarySubtotal).toFixed(2));

        let status: OrderStatus;
        if (i < Math.floor(ordersToCreate * 0.6)) {
          status = OrderStatus.COMPLETED;
        } else if (i < Math.floor(ordersToCreate * 0.8)) {
          status = OrderStatus.RETURNED;
        } else if (i < Math.floor(ordersToCreate * 0.9)) {
          status = OrderStatus.PENDING;
        } else {
          status = OrderStatus.CANCELLED;
        }

        const dayOffset = existingAnalyticsOrders + i;
        const order = orderRepo.create({
          customerId: customer.id,
          storeId: currentStore.id,
          totalAmount,
          status,
          shippingCity: cities[dayOffset % cities.length],
          shippingArea: `Area ${((dayOffset % 7) + 1).toString()}`,
          shippingAddress: `House ${100 + dayOffset}, Road ${((dayOffset % 15) + 1).toString()}`,
          createdAt: new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000),
        });

        const savedOrder = await orderRepo.save(order);

        const orderItems: OrderItem[] = [
          orderItemRepo.create({
            orderId: savedOrder.id,
            productId: primaryProduct.id,
            quantity: primaryQuantity,
            unitPrice: Number(primaryProduct.price),
            subtotal: Number(primarySubtotal.toFixed(2)),
          }),
        ];

        if (secondaryQuantity > 0) {
          orderItems.push(
            orderItemRepo.create({
              orderId: savedOrder.id,
              productId: secondaryProduct.id,
              quantity: secondaryQuantity,
              unitPrice: Number(secondaryProduct.price),
              subtotal: Number(secondarySubtotal.toFixed(2)),
            }),
          );
        }

        await orderItemRepo.save(orderItems);
      }

      console.log(`Created ${ordersToCreate} analytics seed orders for store: ${currentStore.slug}`);
    }

    console.log('Seeding completed successfully');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
