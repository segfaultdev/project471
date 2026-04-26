/**
 * CategoriesController - Handles HTTP requests for category operations
 * All routes start with /categories
 * All routes need JWT token (global guard)
 * 
 * Role-based access:
 * - Create/Update/Delete categories: Only VENDOR role (in their stores)
 * - View categories: All users
 * 
 * Available endpoints:
 * POST   /categories              - Create new category (Vendor only)
 * GET    /categories              - Get all categories
 * GET    /categories/my-categories - Get categories from vendor's stores
 * GET    /categories/store/:storeId - Get categories by store
 * GET    /categories/slug/:slug   - Get category by slug
 * GET    /categories/:id          - Get category by ID
 * PATCH  /categories/:id          - Update category (Vendor only)
 * DELETE /categories/:id          - Delete category (Vendor only)
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StoresService } from '../stores/stores.service';

@Controller('categories') // All routes start with /categories
export class CategoriesController {
  // Inject CategoriesService and StoresService
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly storesService: StoresService,
  ) {}

  /**
   * POST /categories - Create a new category
   * Only VENDOR can create categories in their own stores
   * storeId is passed in request body, verified to belong to vendor
   */
  @Roles(UserRole.VENDOR)
  @Post()
  async create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    // Verify the store belongs to the vendor
    const store = await this.storesService.findOne(createCategoryDto.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only create categories in your own stores');
    }

    return this.categoriesService.create(createCategoryDto.storeId, createCategoryDto);
  }

  /**
   * GET /categories - Get all categories
   */
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * GET /categories/my-categories - Get all categories from vendor's stores
   * Only for VENDOR role
   */
  @Roles(UserRole.VENDOR)
  @Get('my-categories')
  async getMyCategories(@Request() req) {
    // Get all stores owned by vendor
    const stores = await this.storesService.findByOwner(req.user.id);
    const storeIds = stores.map((store) => store.id);

    // Get all categories from these stores
    const allCategories = await this.categoriesService.findAll();
    return allCategories.filter((category) => storeIds.includes(category.storeId));
  }

  /**
   * GET /categories/store/:storeId - Get categories by store
   */
  @Get('store/:storeId')
  findByStore(@Param('storeId') storeId: string) {
    return this.categoriesService.findByStore(storeId);
  }

  /**
   * GET /categories/slug/:slug - Get category by slug
   */
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * GET /categories/:id - Get single category by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * PATCH /categories/:id - Update category
   * Only VENDOR can update, and must own the store
   */
  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    // Get category to verify ownership
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const store = await this.storesService.findOne(category.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only update categories in your own stores');
    }

    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * DELETE /categories/:id - Delete category
   * Only VENDOR can delete, and must own the store
   */
  @Roles(UserRole.VENDOR)
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    // Get category to verify ownership
    const category = await this.categoriesService.findOne(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const store = await this.storesService.findOne(category.storeId);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only delete categories in your own stores');
    }

    return this.categoriesService.delete(id);
  }
}
