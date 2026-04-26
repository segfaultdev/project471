/**
 * ProductsController - Handles HTTP requests for product operations
 * All routes are prefixed with '/products'
 * All routes are protected by JWT authentication (global guard)
 * 
 * Role-based access:
 * - Create/Update/Delete products: Only VENDOR role (must own the store)
 * - View products: All authenticated users
 * 
 * Available endpoints:
 * POST   /products                    - Create new product (Vendor only)
 * GET    /products                    - Get all products
 * GET    /products/:id                - Get single product by ID
 * GET    /products/store/:storeId     - Get products by store
 * GET    /products/category/:category - Get products by category
 * GET    /products/compare/:productId - Get similar products for comparison
 * GET    /products/my-products        - Get products from vendor's stores
 * PATCH  /products/:id                - Update product (Vendor only, own store)
 * DELETE /products/:id                - Delete product (Vendor only, own store)
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';

@Controller('products') // All routes start with /products
export class ProductsController {
  // Inject ProductsService and StoresService
  constructor(
    private readonly productsService: ProductsService,
    private readonly storesService: StoresService,
  ) {}

  /**
   * POST /products - Create a new product
   * Only VENDOR can create products in their own stores
   * Example: POST http://localhost:3000/products
   * Body: { "name": "Product", "price": 99.99, "storeId": "uuid", ... }
   */
  @Roles(UserRole.VENDOR)
  @Post()
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    // Verify store exists and belongs to the current vendor
    const store = await this.storesService.findOne(createProductDto.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only add products to your own stores');
    }
    return this.productsService.create(createProductDto);
  }

  /**
   * GET /products - Get all products
   * Example: GET http://localhost:3000/products
   */
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  /**
   * GET /products/my-products - Get all products from vendor's stores
   * Example: GET http://localhost:3000/products/my-products
   * IMPORTANT: This must come BEFORE :id route to avoid matching "my-products" as an id
   */
  @Roles(UserRole.VENDOR)
  @Get('my-products')
  async findMyProducts(@Request() req) {
    // Get all stores owned by the vendor
    const stores = await this.storesService.findByOwner(req.user.id);
    const storeIds = stores.map(store => store.id);
    
    // Get products from all vendor's stores
    const productsPromises = storeIds.map(storeId => 
      this.productsService.findByStore(storeId)
    );
    const productsArrays = await Promise.all(productsPromises);
    
    // Flatten array of arrays into single array
    return productsArrays.flat();
  }

  /**
   * GET /products/store/:storeId - Get products by store
   * Example: GET http://localhost:3000/products/store/store-uuid
   */
  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.productsService.findByStore(storeId);
  }

  /**
   * GET /products/category/:category - Get products by category
   * Example: GET http://localhost:3000/products/category/Electronics
   */
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  /**
   * GET /products/compare/:productId - Get similar products for comparison
   * Returns products in the same category with similar names from different sellers
   * Example: GET http://localhost:3000/products/compare/uuid-here
   */
  @Get('compare/:productId')
  async compareSimilarProducts(@Param('productId') productId: string) {
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productsService.findSimilarProducts(product.name, product.categoryId, productId);
  }

  /**
   * GET /products/:id - Get single product by ID
   * Example: GET http://localhost:3000/products/uuid-here
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * PATCH /products/:id - Update a product
   * Only VENDOR can update, and only products in their own stores
   * Example: PATCH http://localhost:3000/products/uuid-here
   * Body: { "price": 89.99 }
   */
  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // Verify product exists
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    // Verify the store belongs to the current vendor
    const store = await this.storesService.findOne(product.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only update products in your own stores');
    }
    
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id - Delete a product
   * Only VENDOR can delete, and only products in their own stores
   * Example: DELETE http://localhost:3000/products/uuid-here
   */
  @Roles(UserRole.VENDOR)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    // Verify product exists
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    // Verify the store belongs to the current vendor
    const store = await this.storesService.findOne(product.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only delete products in your own stores');
    }
    
    return this.productsService.remove(id);
  }
}
