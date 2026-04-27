/**
 * Seed Script - Creates fake users, stores, and products for testing
 * Run: node seed-database.js
 */

const API_URL = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

// Store tokens for authenticated requests
let bobaToken = '';
let coffeeToken = '';
let bobaUserId = '';
let coffeeUserId = '';
let bobaStoreId = '';
let coffeeStoreId = '';
let bobaDrinkCategoryId = '';
let bobaDessertCategoryId = '';
let coffeeDrinkCategoryId = '';
let coffeeDessertCategoryId = '';

// User data
const bobaUser = {
  email: 'bobateashop@gmail.com',
  password: '123456',
  firstName: 'Boba',
  lastName: 'Master',
  role: 'vendor',
};

const coffeeUser = {
  email: 'coffeeshop@gmail.com',
  password: '123456',
  firstName: 'Coffee',
  lastName: 'Lover',
  role: 'vendor',
};

// Boba Tea Products (10 items)
const bobaProducts = [
  // Drinks
  {
    name: 'Classic Milk Tea',
    description: 'Traditional milk tea with chewy boba pearls',
    price: 4.99,
    stock: 50,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Taro Milk Tea',
    description: 'Creamy taro flavored milk tea with boba',
    price: 5.49,
    stock: 45,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Strawberry Boba',
    description: 'Fresh strawberry flavor with tapioca pearls',
    price: 5.29,
    stock: 40,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Matcha Latte',
    description: 'Smooth green tea matcha with milk and boba',
    price: 5.99,
    stock: 35,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Mango Boba',
    description: 'Tropical mango juice with chewy boba',
    price: 5.49,
    stock: 50,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Brown Sugar Boba',
    description: 'Rich brown sugar syrup with milk tea and boba',
    price: 5.29,
    stock: 55,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Lychee Tea',
    description: 'Sweet lychee flavored tea with boba pearls',
    price: 5.49,
    stock: 42,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Honeydew Boba',
    description: 'Refreshing honeydew melon with tapioca',
    price: 5.79,
    stock: 38,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Thai Tea Boba',
    description: 'Authentic Thai tea with condensed milk and boba',
    price: 5.99,
    stock: 40,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Passion Fruit Boba',
    description: 'Tangy passion fruit juice with chewy pearls',
    price: 5.59,
    stock: 48,
    images: [],
    category: 'Drink',
  },
];

// Coffee Shop Products (10 items)
const coffeeProducts = [
  // Drinks
  {
    name: 'Espresso',
    description: 'Double shot of rich, bold espresso',
    price: 3.49,
    stock: 100,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    price: 4.49,
    stock: 85,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Latte',
    description: 'Creamy espresso with velvety steamed milk',
    price: 4.79,
    stock: 90,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Americano',
    description: 'Espresso shots topped with hot water',
    price: 3.99,
    stock: 95,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Mocha',
    description: 'Espresso, steamed milk, and rich chocolate',
    price: 5.29,
    stock: 75,
    images: [],
    category: 'Drink',
  },
  {
    name: 'Caramel Macchiato',
    description: 'Espresso with vanilla syrup, milk, and caramel drizzle',
    price: 5.49,
    stock: 70,
    images: [],
    category: 'Drink',
  },
  // Desserts
  {
    name: 'Chocolate Croissant',
    description: 'Buttery croissant filled with dark chocolate',
    price: 3.99,
    stock: 30,
    images: [],
    category: 'Dessert',
  },
  {
    name: 'Blueberry Cheesecake',
    description: 'Creamy cheesecake with fresh blueberries',
    price: 5.99,
    stock: 20,
    images: [],
    category: 'Dessert',
  },
  {
    name: 'Carrot Cake',
    description: 'Moist carrot cake with cream cheese frosting',
    price: 4.49,
    stock: 25,
    images: [],
    category: 'Dessert',
  },
  {
    name: 'Vanilla Latte',
    description: 'Smooth latte with vanilla syrup and whipped cream',
    price: 4.99,
    stock: 60,
    images: [],
    category: 'Drink',
  },
];

// Main function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Step 1: Register or Login Boba User
    console.log('📝 Registering/Logging in Boba Tea Shop user...');
    try {
      let response = await apiCall('POST', '/auth/register', bobaUser);
      bobaToken = response.access_token;
      bobaUserId = response.user.id;
      console.log(`✅ Boba user created: ${bobaUser.email}`);
    } catch (err) {
      if (err.message.includes('Email already exists')) {
        console.log(`ℹ️  User already exists, logging in...`);
        let response = await apiCall('POST', '/auth/login', {
          email: bobaUser.email,
          password: bobaUser.password,
        });
        bobaToken = response.access_token;
        bobaUserId = response.user.id;
        console.log(`✅ Logged in as: ${bobaUser.email}`);
      } else {
        throw err;
      }
    }

    // Step 2: Register or Login Coffee User
    console.log('📝 Registering/Logging in Coffee Shop user...');
    try {
      let response = await apiCall('POST', '/auth/register', coffeeUser);
      coffeeToken = response.access_token;
      coffeeUserId = response.user.id;
      console.log(`✅ Coffee user created: ${coffeeUser.email}`);
    } catch (err) {
      if (err.message.includes('Email already exists')) {
        console.log(`ℹ️  User already exists, logging in...`);
        let response = await apiCall('POST', '/auth/login', {
          email: coffeeUser.email,
          password: coffeeUser.password,
        });
        coffeeToken = response.access_token;
        coffeeUserId = response.user.id;
        console.log(`✅ Logged in as: ${coffeeUser.email}`);
      } else {
        throw err;
      }
    }
    console.log('');

    // Step 3: Get or Create Boba Tea Store
    console.log('🏪 Getting/Creating Boba Tea Store...');
    try {
      let response = await apiCall('POST', '/stores', {
        name: 'Pearl Dreams Boba Tea',
        description: 'Premium boba tea shop serving authentic bubble tea drinks with fresh ingredients',
        slug: 'pearl-dreams-boba',
        address: '123 Tea Lane, Flavor City, TC 12345',
      }, bobaToken);
      bobaStoreId = response.id;
      console.log(`✅ Boba store created: Pearl Dreams Boba Tea`);
    } catch (err) {
      // If store already exists, try to get it
      console.log(`ℹ️  Store may already exist, retrieving...`);
      let response = await apiCall('GET', '/stores/my-stores', null, bobaToken);
      const existingStore = response.find(s => s.slug === 'pearl-dreams-boba');
      if (existingStore) {
        bobaStoreId = existingStore.id;
        console.log(`✅ Using existing store: ${existingStore.name}`);
      } else {
        throw err;
      }
    }

    // Step 4: Get or Create Coffee Shop Store
    console.log('🏪 Getting/Creating Coffee Shop...');
    try {
      let response = await apiCall('POST', '/stores', {
        name: 'Brew Haven Coffee Co',
        description: 'Artisan coffee shop offering specialty espresso drinks and fresh-baked desserts',
        slug: 'brew-haven-coffee',
        address: '456 Coffee Street, Bean Town, CB 67890',
      }, coffeeToken);
      coffeeStoreId = response.id;
      console.log(`✅ Coffee store created: Brew Haven Coffee Co`);
    } catch (err) {
      // If store already exists, try to get it
      console.log(`ℹ️  Store may already exist, retrieving...`);
      let response = await apiCall('GET', '/stores/my-stores', null, coffeeToken);
      const existingStore = response.find(s => s.slug === 'brew-haven-coffee');
      if (existingStore) {
        coffeeStoreId = existingStore.id;
        console.log(`✅ Using existing store: ${existingStore.name}`);
      } else {
        throw err;
      }
    }
    console.log('');

    // Step 5: Create Categories for Boba Store
    console.log('📂 Creating categories for Boba Tea Shop...');
    response = await apiCall(
      'POST',
      '/categories',
      {
        name: 'Drink',
        description: 'Bubble tea drinks and beverages',
        storeId: bobaStoreId,
      },
      bobaToken
    );
    bobaDrinkCategoryId = response.id;
    console.log('  ✓ Drink category created');

    response = await apiCall(
      'POST',
      '/categories',
      {
        name: 'Dessert',
        description: 'Sweet treats and desserts',
        storeId: bobaStoreId,
      },
      bobaToken
    );
    bobaDessertCategoryId = response.id;
    console.log('  ✓ Dessert category created\n');

    // Step 6: Create Categories for Coffee Store
    console.log('📂 Creating categories for Coffee Shop...');
    response = await apiCall(
      'POST',
      '/categories',
      {
        name: 'Drink',
        description: 'Coffee drinks and beverages',
        storeId: coffeeStoreId,
      },
      coffeeToken
    );
    coffeeDrinkCategoryId = response.id;
    console.log('  ✓ Drink category created');

    response = await apiCall(
      'POST',
      '/categories',
      {
        name: 'Dessert',
        description: 'Pastries and desserts',
        storeId: coffeeStoreId,
      },
      coffeeToken
    );
    coffeeDessertCategoryId = response.id;
    console.log('  ✓ Dessert category created\n');

    // Step 7: Add Boba Products
    console.log('🧋 Adding Boba Tea Products (10 items)...');
    for (let i = 0; i < bobaProducts.length; i++) {
      const product = bobaProducts[i];
      const categoryId = product.category === 'Drink' ? bobaDrinkCategoryId : bobaDessertCategoryId;

      await apiCall(
        'POST',
        '/products',
        {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: product.images,
          storeId: bobaStoreId,
          categoryId: categoryId,
        },
        bobaToken
      );
      console.log(`  ✓ ${product.name}`);
    }
    console.log('✅ All boba products added!\n');

    // Step 8: Add Coffee Products
    console.log('☕ Adding Coffee Shop Products (10 items)...');
    for (let i = 0; i < coffeeProducts.length; i++) {
      const product = coffeeProducts[i];
      const categoryId = product.category === 'Drink' ? coffeeDrinkCategoryId : coffeeDessertCategoryId;

      await apiCall(
        'POST',
        '/products',
        {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          images: product.images,
          storeId: coffeeStoreId,
          categoryId: categoryId,
        },
        coffeeToken
      );
      console.log(`  ✓ ${product.name}`);
    }
    console.log('✅ All coffee products added!\n');

    // Print Summary
    console.log('✨ Database Seeding Complete!\n');
    console.log('📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🥤 BOBA TEA SHOP');
    console.log(`   Email: ${bobaUser.email}`);
    console.log(`   Password: ${bobaUser.password}`);
    console.log(`   Store: Pearl Dreams Boba Tea`);
    console.log(`   Categories: Drink, Dessert`);
    console.log(`   Products: 10 bubble tea items`);
    console.log(`   User ID: ${bobaUserId}`);
    console.log(`   Store ID: ${bobaStoreId}`);

    console.log('\n☕ COFFEE SHOP');
    console.log(`   Email: ${coffeeUser.email}`);
    console.log(`   Password: ${coffeeUser.password}`);
    console.log(`   Store: Brew Haven Coffee Co`);
    console.log(`   Categories: Drink, Dessert`);
    console.log(`   Products: 10 coffee drinks & desserts`);
    console.log(`   User ID: ${coffeeUserId}`);
    console.log(`   Store ID: ${coffeeStoreId}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ You can now login to test the application!');
    console.log('\n');
  } catch (error) {
    console.error('❌ Error during seeding:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
