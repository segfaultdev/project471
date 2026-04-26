/**
 * CategoriesService - Business logic for category management
 * Handles all database operations for categories (CRUD)
 */
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    // Inject TypeORM repository for Category entity
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * Generate a URL-friendly slug from category name
   * @param name - Category name
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
   * @param excludeId - Category ID to exclude from check (for updates)
   * @returns Promise<string> - Unique slug
   */
  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.categoriesRepository.findOne({
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
   * Create a new category
   * @param storeId - Store that owns this category
   * @param createCategoryDto - Category data (name, description)
   * @returns Promise<Category> - Created category
   */
  async create(storeId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Validate that category name is provided
    if (!createCategoryDto.name || createCategoryDto.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    // Generate slug from name and ensure uniqueness
    const baseSlug = this.generateSlug(createCategoryDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Create new category instance
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      slug,
      storeId,
    });

    // Save to database and return
    return this.categoriesRepository.save(category);
  }

  /**
   * Get all categories for a specific store
   * @param storeId - Store ID to filter by
   * @returns Promise<Category[]> - Array of categories
   */
  async findByStore(storeId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { storeId },
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all categories across all stores
   * @returns Promise<Category[]> - Array of all categories
   */
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single category by ID
   * @param id - Category ID
   * @returns Promise<Category> - Category object
   * @throws NotFoundException - If category not found
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products', 'store'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Get category by slug
   * @param slug - Category slug
   * @returns Promise<Category> - Category object
   * @throws NotFoundException - If category not found
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { slug },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  /**
   * Update a category
   * @param id - Category ID
   * @param updateCategoryDto - Updated category data
   * @returns Promise<Category> - Updated category
   * @throws NotFoundException - If category not found
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Verify category exists
    const category = await this.findOne(id);

    // Update slug if name changed
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const baseSlug = this.generateSlug(updateCategoryDto.name);
      const slug = await this.ensureUniqueSlug(baseSlug, id);
      category.slug = slug;
    }

    // Update fields
    Object.assign(category, updateCategoryDto);

    // Save and return
    return this.categoriesRepository.save(category);
  }

  /**
   * Delete a category
   * @param id - Category ID
   * @returns Promise<void>
   * @throws NotFoundException - If category not found
   */
  async delete(id: string): Promise<void> {
    // Verify category exists
    const category = await this.findOne(id);

    // Delete from database
    await this.categoriesRepository.remove(category);
  }
}
