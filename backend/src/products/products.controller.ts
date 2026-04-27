import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';

@Controller('products') // All routes start with /products
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storesService: StoresService,
  ) {}

  @Roles(UserRole.VENDOR)
  @Post()
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const store = await this.storesService.findOne(createProductDto.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only add products to your own stores');
    }
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Roles(UserRole.VENDOR)
  @Get('my-products')
  async findMyProducts(@Request() req) {
    const stores = await this.storesService.findByOwner(req.user.id);
    const storeIds = stores.map(store => store.id);
    
    const productsPromises = storeIds.map(storeId => 
      this.productsService.findByStore(storeId)
    );
    const productsArrays = await Promise.all(productsPromises);
    
    return productsArrays.flat();
  }

  @Public()
  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.productsService.findByStore(storeId);
  }

  @Public()
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }

  @Public()
  @Get('compare/:productId')
  async compareSimilarProducts(@Param('productId') productId: string) {
    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productsService.findSimilarProducts(product.name, productId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    const store = await this.storesService.findOne(product.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only update products in your own stores');
    }
    
    return this.productsService.update(id, updateProductDto);
  }

  @Roles(UserRole.VENDOR)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
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
