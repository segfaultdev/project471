/**
 * StoresService - Business logic for store management
 * Handles all database operations for stores (CRUD)
 */
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Product } from '../products/entities/product.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    // Inject TypeORM repository for Store entity
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    // Inject TypeORM repository for Product entity to manage cascade deletion
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  /**
   * Generate a URL-friendly slug from store name
   * @param name - Store name
   * @returns string - URL-safe slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Ensure slug is unique by appending number if needed
   * @param baseSlug - Base slug to check
   * @param excludeId - Store ID to exclude from check (for updates)
   * @returns Promise<string> - Unique slug
   */
  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.storesRepository.findOne({
        where: { slug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Create a new store
   * @param createStoreDto - Store data to create
   * @returns Promise<Store> - The created store
   * SQL: INSERT INTO stores (...) VALUES (...)
   */
  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    // Generate unique slug from store name
    const baseSlug = this.generateSlug(createStoreDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const store = this.storesRepository.create({
      ...createStoreDto,
      slug,
    });
    return this.storesRepository.save(store);
  }

  /**
   * Get all stores from database
   * @returns Promise<Store[]> - Array of all stores
   * SQL: SELECT * FROM stores
   */
  async findAll(): Promise<Store[]> {
    const stores = await this.storesRepository.find({
      relations: ['owner'], // Include owner information
    });
    
    // Auto-generate slugs for existing stores that don't have them
    await this.generateMissingSlugs(stores);
    
    return stores;
  }

  /**
   * Generate slugs for stores that don't have them
   * @param stores - Array of stores to check
   */
  private async generateMissingSlugs(stores: Store[]): Promise<void> {
    for (const store of stores) {
      if (!store.slug) {
        const baseSlug = this.generateSlug(store.name);
        const slug = await this.ensureUniqueSlug(baseSlug, store.id);
        await this.storesRepository.update(store.id, { slug });
        store.slug = slug; // Update in-memory object
      }
    }
  }

  /**
   * Find a single store by ID
   * @param id - Store's UUID
   * @returns Promise<Store | null> - Store object or null if not found
   * SQL: SELECT * FROM stores WHERE id = ?
   */
  async findOne(id: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { id },
      relations: ['owner'], // Include owner information
    });
  }

  /**
   * Find a single store by slug
   * @param slug - Store's unique slug
   * @returns Promise<Store | null> - Store object or null if not found
   * SQL: SELECT * FROM stores WHERE slug = ?
   */
  async findBySlug(slug: string): Promise<Store | null> {
    return this.storesRepository.findOne({
      where: { slug },
      relations: ['owner'], // Include owner information
    });
  }

  /**
   * Find stores by owner ID
   * @param ownerId - User's UUID
   * @returns Promise<Store[]> - Array of stores owned by user
   * SQL: SELECT * FROM stores WHERE ownerId = ?
   */
  async findByOwner(ownerId: string): Promise<Store[]> {
    const stores = await this.storesRepository.find({
      where: { ownerId },
      relations: ['owner'],
    });
    
    // Auto-generate slugs for existing stores that don't have them
    await this.generateMissingSlugs(stores);
    
    return stores;
  }

  /**
   * Update an existing store
   * @param id - Store's UUID
   * @param updateStoreDto - Fields to update
   * @returns Promise<Store | null> - Updated store or null if not found
   * SQL: UPDATE stores SET ... WHERE id = ?
   */
  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store | null> {
    // If name is being updated, regenerate slug
    if (updateStoreDto.name) {
      const baseSlug = this.generateSlug(updateStoreDto.name);
      const slug = await this.ensureUniqueSlug(baseSlug, id);
      updateStoreDto = { ...updateStoreDto, slug } as any;
    }

    await this.storesRepository.update(id, updateStoreDto);
    return this.findOne(id);
  }

  /**
   * Delete a store from database
   * First deletes all products associated with the store to avoid foreign key constraint violation
   * @param id - Store's UUID
   * @returns Promise<void>
   * SQL: DELETE FROM products WHERE storeId = ?; DELETE FROM stores WHERE id = ?
   */
  async remove(id: string): Promise<void> {
    // First, delete all products associated with this store
    await this.productsRepository.delete({ storeId: id });
    
    // Then delete the store
    await this.storesRepository.delete(id);
  }
}
