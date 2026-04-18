/**
 * StoresController - Handles HTTP requests for store operations
 * All routes are prefixed with '/stores'
 * All routes are protected by JWT authentication (global guard)
 * 
 * Role-based access:
 * - Create/Update/Delete stores: Only VENDOR role
 * - View stores: All authenticated users
 * 
 * Available endpoints:
 * POST   /stores              - Create new store (Vendor only)
 * GET    /stores              - Get all stores
 * GET    /stores/my-stores    - Get stores owned by authenticated user
 * GET    /stores/owner/:ownerId - Get stores by owner
 * GET    /stores/slug/:slug   - Get single store by slug
 * GET    /stores/:id          - Get single store by ID
 * PATCH  /stores/:id          - Update store (Vendor only, own stores)
 * DELETE /stores/:id          - Delete store (Vendor only, own stores)
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('stores') // All routes start with /stores
export class StoresController {
  // Inject StoresService to access business logic
  constructor(private readonly storesService: StoresService) {}

  /**
   * POST /stores - Create a new store
   * Only VENDOR role can create stores
   * ownerId is automatically set from authenticated user
   * Example: POST http://localhost:3000/stores
   * Body: { "name": "My Store", "description": "...", ... }
   */
  @Roles(UserRole.VENDOR)
  @Post()
  create(@Request() req, @Body() createStoreDto: CreateStoreDto) {
    // Auto-set ownerId from authenticated user
    return this.storesService.create({ ...createStoreDto, ownerId: req.user.id });
  }

  /**
   * GET /stores - Get all stores
   * Example: GET http://localhost:3000/stores
   */
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  /**
   * GET /stores/my-stores - Get stores owned by authenticated user
   * Example: GET http://localhost:3000/stores/my-stores
   * IMPORTANT: This must come BEFORE :id route to avoid matching "my-stores" as an id
   */
  @Get('my-stores')
  findMyStores(@Request() req) {
    return this.storesService.findByOwner(req.user.id);
  }

  /**
   * GET /stores/owner/:ownerId - Get stores by owner
   * Example: GET http://localhost:3000/stores/owner/user-uuid
   */
  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.storesService.findByOwner(ownerId);
  }

  /**
   * GET /stores/slug/:slug - Get single store by slug
   * Example: GET http://localhost:3000/stores/slug/my-store-name
   * IMPORTANT: This must come BEFORE :id route
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const store = await this.storesService.findBySlug(slug);
    if (!store) {
      throw new NotFoundException(`Store with slug "${slug}" not found`);
    }
    return store;
  }

  /**
   * GET /stores/:id - Get single store by ID
   * Example: GET http://localhost:3000/stores/uuid-here
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  /**
   * PATCH /stores/:id - Update a store
   * Only VENDOR can update, and only their own stores
   * Example: PATCH http://localhost:3000/stores/uuid-here
   * Body: { "name": "Updated Name" }
   */
  @Roles(UserRole.VENDOR)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    // Verify store exists and belongs to the current user
    const store = await this.storesService.findOne(id);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only update your own stores');
    }
    return this.storesService.update(id, updateStoreDto);
  }

  /**
   * DELETE /stores/:id - Delete a store
   * Only VENDOR can delete, and only their own stores
   * Example: DELETE http://localhost:3000/stores/uuid-here
   */
  @Roles(UserRole.VENDOR)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    // Verify store exists and belongs to the current user
    const store = await this.storesService.findOne(id);
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.ownerId !== req.user.id) {
      throw new ForbiddenException('You can only delete your own stores');
    }
    return this.storesService.remove(id);
  }
}
