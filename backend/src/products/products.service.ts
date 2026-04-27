import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['store'], // Include store information
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['store'], // Include store information
    });
  }

  async findByStore(storeId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { storeId },
      relations: ['store'],
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { category },
      relations: ['store'],
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }

  /**
   * Find similar products from multiple sellers
   * @param productName - Name of product to find similar ones
   * @param excludeProductId - Product ID to exclude from results
   * @returns Promise<Product[]> - Array of similar products from different stores
   * SQL: SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?) AND id != ? ORDER BY store information
   */
  async findSimilarProducts(productName: string, excludeProductId?: string): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .where('LOWER(product.name) LIKE LOWER(:name)', { name: `%${productName}%` })
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true })
      .orderBy('store.rating', 'DESC')
      .addOrderBy('product.price', 'ASC')
      .limit(10);

    if (excludeProductId) {
      query.andWhere('product.id != :excludeProductId', { excludeProductId });
    }

    return query.getMany();
  }
}
