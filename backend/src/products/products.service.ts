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
      relations: ['store'], // Include store information
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
      relations: ['store'], // Include store information
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
      relations: ['store'],
    });
  }

  /**
   * Find products by category
   * @param category - Product category name
   * @returns Promise<Product[]> - Array of products in this category
   * SQL: SELECT * FROM products WHERE category = ?
   */
  async findByCategory(category: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { category },
      relations: ['store'],
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
}
