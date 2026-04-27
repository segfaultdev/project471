import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Coupon, DiscountType } from '../coupons/coupon.entity';
import { Order, OrderStatus } from '../stores/entities/order.entity';
import { OrderItem } from '../stores/entities/order-item.entity';
import { StoreFollow } from '../stores/entities/store-follow.entity';

function buildDataSource(): DataSource {
  const isProduction =
    (process.env.NODE_ENV || '').toLowerCase() === 'production';
  const synchronize =
    (process.env.DB_SYNCHRONIZE || (!isProduction).toString()) === 'true';
  const logging =
    (process.env.DB_LOGGING || (!isProduction).toString()) === 'true';

  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [
      User,
      Store,
      Product,
      Category,
      Coupon,
      Order,
      OrderItem,
      StoreFollow,
    ],
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
    const categoryRepo = dataSource.getRepository(Category);
    const couponRepo = dataSource.getRepository(Coupon);
    const orderRepo = dataSource.getRepository(Order);
    const orderItemRepo = dataSource.getRepository(OrderItem);
    const storeFollowRepo = dataSource.getRepository(StoreFollow);

    const seededPassword = await bcrypt.hash('SeedPass123!', 10);
    const slugify = (value: string) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const demoUsers = [
      {
        email: 'vendor.seed@ecom471.local',
        firstName: 'Seed',
        lastName: 'Vendor',
        role: UserRole.VENDOR,
      },
      {
        email: 'vendor.two.seed@ecom471.local',
        firstName: 'Second',
        lastName: 'Vendor',
        role: UserRole.VENDOR,
      },
      {
        email: 'customer.seed@ecom471.local',
        firstName: 'Seed',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
      },
      {
        email: 'customer.two.seed@ecom471.local',
        firstName: 'Second',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
      },
    ];

    const seededUsers = new Map<string, User>();
    for (const userData of demoUsers) {
      let user = await userRepo.findOne({ where: { email: userData.email } });
      if (!user) {
        user = await userRepo.save(
          userRepo.create({
            ...userData,
            password: seededPassword,
          }),
        );
        console.log(`Created ${userData.role} user: ${userData.email}`);
      } else {
        console.log(`${userData.role} user already exists: ${userData.email}`);
      }
      seededUsers.set(userData.email, user);
    }

    const vendor = seededUsers.get('vendor.seed@ecom471.local') as User;
    const secondVendor = seededUsers.get(
      'vendor.two.seed@ecom471.local',
    ) as User;
    const customer = seededUsers.get('customer.seed@ecom471.local') as User;
    const secondCustomer = seededUsers.get(
      'customer.two.seed@ecom471.local',
    ) as User;

    const demoStores = [
      ['Seed Store', 'seed-store', 'Seeded demo store', vendor, 'General'],
      [
        'Urban Threads',
        'urban-threads',
        'Everyday apparel and accessories.',
        vendor,
        'Fashion',
      ],
      [
        'Tech Nest',
        'tech-nest',
        'Smart gadgets and useful accessories.',
        vendor,
        'Electronics',
      ],
      [
        'Home Harbor',
        'home-harbor',
        'Home goods for practical living.',
        vendor,
        'Home',
      ],
      [
        'Fresh Basket',
        'fresh-basket',
        'Groceries and pantry favorites.',
        vendor,
        'Grocery',
      ],
      [
        'Glow Studio',
        'glow-studio',
        'Beauty, skincare, and self-care picks.',
        secondVendor,
        'Beauty',
      ],
      [
        'Book Nook',
        'book-nook',
        'Books, stationery, and study essentials.',
        secondVendor,
        'Books',
      ],
      [
        'Fit Gear',
        'fit-gear',
        'Sportswear and compact fitness gear.',
        secondVendor,
        'Sports',
      ],
      [
        'Petal Point',
        'petal-point',
        'Flowers, gifts, and small celebrations.',
        secondVendor,
        'Gifts',
      ],
      [
        'Craft Corner',
        'craft-corner',
        'Handmade goods and creative supplies.',
        secondVendor,
        'Crafts',
      ],
    ] as const;

    const storesBySlug = new Map<string, Store>();
    for (const [name, slug, description, owner, category] of demoStores) {
      let currentStore = await storeRepo.findOne({ where: { slug } });
      if (!currentStore) {
        currentStore = await storeRepo.save(
          storeRepo.create({
            name,
            slug,
            description,
            category,
            ownerId: owner.id,
            email: owner.email,
            phone: '+8801700000000',
            address: 'Dhaka, Bangladesh',
            isActive: true,
          }),
        );
        console.log(`Created seed store: ${slug}`);
      } else {
        console.log(`Seed store already exists: ${slug}`);
      }
      storesBySlug.set(slug, currentStore);
    }

    const demoCatalog: Record<
      string,
      Array<{
        category: string;
        products: Array<{
          name: string;
          description: string;
          price: number;
          stock: number;
        }>;
      }>
    > = {
      'seed-store': [
        {
          category: 'General',
          products: [
            {
              name: 'Everyday Tote Bag',
              description: 'Durable daily carry bag for errands and shopping.',
              price: 899,
              stock: 40,
            },
            {
              name: 'Reusable Water Bottle',
              description: 'Insulated bottle for school, office, and travel.',
              price: 650,
              stock: 55,
            },
          ],
        },
      ],
      'urban-threads': [
        {
          category: 'T-Shirts',
          products: [
            {
              name: 'Oversized Cotton T-Shirt',
              description: 'Relaxed fit fashion tee in breathable cotton.',
              price: 790,
              stock: 35,
            },
            {
              name: 'Graphic Streetwear Tee',
              description: 'Printed casual t-shirt for everyday outfits.',
              price: 950,
              stock: 28,
            },
          ],
        },
        {
          category: 'Denim',
          products: [
            {
              name: 'Slim Fit Jeans',
              description: 'Classic blue denim jeans with stretch comfort.',
              price: 1890,
              stock: 22,
            },
            {
              name: 'Denim Jacket',
              description: 'Layering jacket for streetwear and casual fashion.',
              price: 2490,
              stock: 14,
            },
          ],
        },
      ],
      'tech-nest': [
        {
          category: 'Mobile Accessories',
          products: [
            {
              name: 'Fast USB-C Charger',
              description:
                'Compact fast charger for Android and iPhone devices.',
              price: 1190,
              stock: 32,
            },
            {
              name: 'Magnetic Phone Case',
              description: 'Shockproof phone case with magnetic ring support.',
              price: 850,
              stock: 45,
            },
          ],
        },
        {
          category: 'Audio',
          products: [
            {
              name: 'Wireless Earbuds',
              description:
                'Bluetooth earbuds with clear call quality and bass.',
              price: 2290,
              stock: 26,
            },
            {
              name: 'Portable Bluetooth Speaker',
              description: 'Compact speaker for music, travel, and home use.',
              price: 2790,
              stock: 16,
            },
          ],
        },
      ],
      'home-harbor': [
        {
          category: 'Kitchen',
          products: [
            {
              name: 'Nonstick Fry Pan',
              description: 'Easy-clean frying pan for everyday cooking.',
              price: 1450,
              stock: 20,
            },
            {
              name: 'Glass Food Containers',
              description: 'Airtight storage containers for meal prep.',
              price: 1250,
              stock: 30,
            },
          ],
        },
        {
          category: 'Decor',
          products: [
            {
              name: 'Ceramic Table Lamp',
              description: 'Warm bedside lamp for home decor.',
              price: 2100,
              stock: 12,
            },
            {
              name: 'Cotton Cushion Cover',
              description: 'Soft cushion cover for sofa and bedroom styling.',
              price: 450,
              stock: 60,
            },
          ],
        },
      ],
      'fresh-basket': [
        {
          category: 'Fruits',
          products: [
            {
              name: 'Fresh Mango Box',
              description: 'Seasonal sweet mangoes for family sharing.',
              price: 1200,
              stock: 18,
            },
            {
              name: 'Mixed Fruit Pack',
              description: 'Apple, orange, banana, and seasonal fruit bundle.',
              price: 990,
              stock: 25,
            },
          ],
        },
        {
          category: 'Pantry',
          products: [
            {
              name: 'Premium Basmati Rice',
              description: 'Long grain rice for biryani and daily meals.',
              price: 1650,
              stock: 40,
            },
            {
              name: 'Organic Honey Jar',
              description: 'Natural honey for tea, breakfast, and desserts.',
              price: 780,
              stock: 24,
            },
          ],
        },
      ],
      'glow-studio': [
        {
          category: 'Skincare',
          products: [
            {
              name: 'Vitamin C Face Serum',
              description: 'Brightening serum for daily skincare routine.',
              price: 1350,
              stock: 30,
            },
            {
              name: 'Hydrating Face Moisturizer',
              description: 'Lightweight moisturizer for soft skin.',
              price: 1100,
              stock: 34,
            },
          ],
        },
        {
          category: 'Makeup',
          products: [
            {
              name: 'Matte Lipstick Set',
              description: 'Long-lasting lipstick set for everyday makeup.',
              price: 1250,
              stock: 18,
            },
            {
              name: 'Compact Blush Palette',
              description: 'Warm blush shades for natural glow.',
              price: 980,
              stock: 20,
            },
          ],
        },
      ],
      'book-nook': [
        {
          category: 'Books',
          products: [
            {
              name: 'Business Startup Guide',
              description: 'Practical book for small business founders.',
              price: 690,
              stock: 22,
            },
            {
              name: 'Modern Fiction Novel',
              description: 'Contemporary fiction for weekend reading.',
              price: 520,
              stock: 30,
            },
          ],
        },
        {
          category: 'Stationery',
          products: [
            {
              name: 'Hardcover Notebook',
              description: 'Ruled notebook for journaling and study notes.',
              price: 320,
              stock: 50,
            },
            {
              name: 'Gel Pen Pack',
              description: 'Smooth writing pens for school and office.',
              price: 180,
              stock: 80,
            },
          ],
        },
      ],
      'fit-gear': [
        {
          category: 'Fitness',
          products: [
            {
              name: 'Resistance Band Set',
              description: 'Workout bands for strength training at home.',
              price: 890,
              stock: 28,
            },
            {
              name: 'Yoga Mat',
              description: 'Non-slip exercise mat for yoga and stretching.',
              price: 1350,
              stock: 24,
            },
          ],
        },
        {
          category: 'Sportswear',
          products: [
            {
              name: 'Dry Fit Training T-Shirt',
              description: 'Breathable sports t-shirt for gym workouts.',
              price: 850,
              stock: 36,
            },
            {
              name: 'Running Shorts',
              description: 'Lightweight shorts for running and training.',
              price: 790,
              stock: 32,
            },
          ],
        },
      ],
      'petal-point': [
        {
          category: 'Flowers',
          products: [
            {
              name: 'Rose Bouquet',
              description: 'Fresh red rose bouquet for gifts and events.',
              price: 1500,
              stock: 15,
            },
            {
              name: 'Mixed Flower Basket',
              description: 'Colorful flower basket for celebrations.',
              price: 2200,
              stock: 10,
            },
          ],
        },
        {
          category: 'Gifts',
          products: [
            {
              name: 'Greeting Card Set',
              description: 'Premium cards for birthdays and anniversaries.',
              price: 250,
              stock: 45,
            },
            {
              name: 'Chocolate Gift Box',
              description: 'Assorted chocolates for special occasions.',
              price: 950,
              stock: 20,
            },
          ],
        },
      ],
      'craft-corner': [
        {
          category: 'Handmade',
          products: [
            {
              name: 'Handmade Clay Earrings',
              description: 'Lightweight artisan earrings in colorful designs.',
              price: 420,
              stock: 30,
            },
            {
              name: 'Macrame Wall Hanging',
              description: 'Boho wall decor handmade with cotton cord.',
              price: 1350,
              stock: 12,
            },
          ],
        },
        {
          category: 'Art Supplies',
          products: [
            {
              name: 'Acrylic Paint Set',
              description:
                'Bright acrylic paints for artists and hobby crafts.',
              price: 990,
              stock: 25,
            },
            {
              name: 'Sketchbook A4',
              description: 'Thick paper sketchbook for drawing and painting.',
              price: 520,
              stock: 38,
            },
          ],
        },
      ],
    };

    for (const [storeSlug, categoryGroups] of Object.entries(demoCatalog)) {
      const currentStore = storesBySlug.get(storeSlug);
      if (!currentStore) {
        continue;
      }

      for (const categoryGroup of categoryGroups) {
        let category = await categoryRepo.findOne({
          where: { storeId: currentStore.id, name: categoryGroup.category },
        });

        if (!category) {
          category = await categoryRepo.save(
            categoryRepo.create({
              name: categoryGroup.category,
              slug: `${slugify(categoryGroup.category)}-${currentStore.id.slice(0, 8)}`,
              storeId: currentStore.id,
            }),
          );
          console.log(
            `Created category ${categoryGroup.category} for ${currentStore.slug}`,
          );
        }

        for (const productData of categoryGroup.products) {
          const existingProduct = await productRepo.findOne({
            where: {
              storeId: currentStore.id,
              name: productData.name,
            },
          });

          if (!existingProduct) {
            await productRepo.save(
              productRepo.create({
                ...productData,
                categoryId: category.id,
                storeId: currentStore.id,
                images: [],
                isAvailable: true,
              }),
            );
            console.log(
              `Created product ${productData.name} for ${currentStore.slug}`,
            );
          }
        }
      }
    }

    const store = storesBySlug.get('seed-store') as Store;

    const vendorUsers = await userRepo.find({
      where: { role: UserRole.VENDOR },
    });
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

    let generalCategory = await categoryRepo.findOne({
      where: { storeId: store.id, name: 'General' },
    });
    if (!generalCategory) {
      generalCategory = await categoryRepo.save(
        categoryRepo.create({
          name: 'General',
          slug: `general-${store.id.slice(0, 8)}`,
          storeId: store.id,
        }),
      );
    }

    const productsToSeed = [
      {
        name: 'Seed Product A',
        description: 'Demo seeded product A',
        price: 19.99,
        stock: 30,
        categoryId: generalCategory.id,
        images: [],
      },
      {
        name: 'Seed Product B',
        description: 'Demo seeded product B',
        price: 49.5,
        stock: 12,
        categoryId: generalCategory.id,
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
    const existingCoupon = await couponRepo.findOne({
      where: { code: couponCode },
    });
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

    const followedStoreSets = [
      {
        customer,
        storeSlugs: [
          'seed-store',
          'urban-threads',
          'tech-nest',
          'home-harbor',
          'fresh-basket',
        ],
      },
      {
        customer: secondCustomer,
        storeSlugs: [
          'glow-studio',
          'book-nook',
          'fit-gear',
          'petal-point',
          'craft-corner',
        ],
      },
    ];

    for (const followSet of followedStoreSets) {
      for (const storeSlug of followSet.storeSlugs.slice(0, 5)) {
        const followedStore = storesBySlug.get(storeSlug);
        if (!followedStore) {
          continue;
        }

        const existingFollow = await storeFollowRepo.findOne({
          where: {
            customerId: followSet.customer.id,
            storeId: followedStore.id,
          },
        });

        if (!existingFollow) {
          await storeFollowRepo.save(
            storeFollowRepo.create({
              customerId: followSet.customer.id,
              storeId: followedStore.id,
            }),
          );
          console.log(
            `${followSet.customer.email} now follows ${followedStore.slug}`,
          );
        }
      }
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
        let fallbackCategory = await categoryRepo.findOne({
          where: { storeId: currentStore.id, name: 'General' },
        });
        if (!fallbackCategory) {
          fallbackCategory = await categoryRepo.save(
            categoryRepo.create({
              name: 'General',
              slug: `general-${currentStore.id.slice(0, 8)}`,
              storeId: currentStore.id,
            }),
          );
        }

        const fallbackProduct = productRepo.create({
          name: `Analytics Product ${currentStore.name}`,
          description: 'Auto-created product for analytics seeding',
          price: 29.99,
          stock: 100,
          categoryId: fallbackCategory.id,
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
        const secondaryProduct =
          productsForStore[(i + 1) % productsForStore.length];

        const primaryQuantity = (i % 3) + 1;
        const secondaryQuantity = i % 2 === 0 ? 1 : 0;

        const primarySubtotal = Number(primaryProduct.price) * primaryQuantity;
        const secondarySubtotal =
          Number(secondaryProduct.price) * secondaryQuantity;
        const totalAmount = Number(
          (primarySubtotal + secondarySubtotal).toFixed(2),
        );

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

      console.log(
        `Created ${ordersToCreate} analytics seed orders for store: ${currentStore.slug}`,
      );
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
