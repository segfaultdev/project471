import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Coupon, DiscountType } from '../coupons/coupon.entity';

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
      entities: [User, Store, Product, Coupon],
      synchronize,
      logging,
    });
  }

  return new DataSource({
    type: 'sqlite',
    database: process.env.SQLITE_PATH || 'database.sqlite',
    entities: [User, Store, Product, Coupon],
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

    console.log('Seeding completed successfully');
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
