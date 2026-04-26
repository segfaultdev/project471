/**
 * ProductsService - Business logic for product management
 * Handles all database operations for products (CRUD)
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    // Inject TypeORM repository for Product entity
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product
   * @param createProductDto - Product data to create
   * @returns Promise<Product> - The created product
   * SQL: INSERT INTO products (...) VALUES (...)
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  /**
   * Get all products from database
   * @returns Promise<Product[]> - Array of all products
   * SQL: SELECT * FROM products
   */
  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['store', 'category'], // Include store and category information
    });
  }

  /**
   * Find a single product by ID
   * @param id - Product's UUID
   * @returns Promise<Product | null> - Product object or null if not found
   * SQL: SELECT * FROM products WHERE id = ?
   */
  async findOne(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['store', 'category'], // Include store and category information
    });
  }

  /**
   * Find products by store ID
   * @param storeId - Store's UUID
   * @returns Promise<Product[]> - Array of products in this store
   * SQL: SELECT * FROM products WHERE storeId = ?
   */
  async findByStore(storeId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { storeId },
      relations: ['store', 'category'],
    });
  }

  /**
   * Find products by category
   * @param categoryId - Product category ID
   * @returns Promise<Product[]> - Array of products in this category
   * SQL: SELECT * FROM products WHERE categoryId = ?
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { categoryId },
      relations: ['store', 'category'],
    });
  }

  /**
   * Update an existing product
   * @param id - Product's UUID
   * @param updateProductDto - Fields to update
   * @returns Promise<Product | null> - Updated product or null if not found
   * SQL: UPDATE products SET ... WHERE id = ?
   */
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  /**
   * Delete a product from database
   * @param id - Product's UUID
   * @returns Promise<void>
   * SQL: DELETE FROM products WHERE id = ?
   */
  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }

  /**
   * Find similar products from multiple sellers
   * Uses flexible matching: same category products, similar names, or similar descriptions
   * @param productName - Name of product to find similar ones
   * @param categoryId - Category ID to find same-category products
   * @param excludeProductId - Product ID to exclude from results
   * @returns Promise<Product[]> - Array of similar products from different stores, ranked by relevance
   */
  async findSimilarProducts(productName: string, categoryId?: string, excludeProductId?: string): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('product.stock > :stock', { stock: 0 });

    // Extract key words from product name for flexible matching
    const nameWords = productName.split(' ').filter(word => word.length > 2);
    const params: any = { isAvailable: true, stock: 0 };
    let paramIndex = 0;

    // Build OR conditions for flexible matching
    const orConditions: string[] = [];

    // Match 1: Same category (highest priority)
    if (categoryId) {
      orConditions.push('product.categoryId = :categoryId');
      params.categoryId = categoryId;
    }

    // Match 2: Similar product name (partial word matching)
    for (const word of nameWords) {
      const paramName = `nameWord${paramIndex}`;
      orConditions.push(`LOWER(product.name) LIKE :${paramName}`);
      params[paramName] = `%${word.toLowerCase()}%`;
      paramIndex++;
    }

    // Match 3: Similar description
    for (const word of nameWords) {
      const paramName = `descWord${paramIndex}`;
      orConditions.push(`LOWER(product.description) LIKE :${paramName}`);
      params[paramName] = `%${word.toLowerCase()}%`;
      paramIndex++;
    }

    // Combine all OR conditions
    if (orConditions.length > 0) {
      query.andWhere(`(${orConditions.join(' OR ')})`);
    }

    if (excludeProductId) {
      query.andWhere('product.id != :excludeProductId', { excludeProductId });
      params.excludeProductId = excludeProductId;
    }

    // Set all parameters
    query.setParameters(params);

    // Sort by relevance: category match first, then store rating, then price
    query.orderBy('store.rating', 'DESC')
      .addOrderBy('product.price', 'ASC')
      .limit(15);

    return query.getMany();
  }
}
