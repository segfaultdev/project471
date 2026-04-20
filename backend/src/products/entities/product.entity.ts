/**
 * Product Entity - Defines the database table structure for products
 * This represents the 'products' table in PostgreSQL
 * Each product belongs to one store (Many-to-One relationship)
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Category } from '../../categories/category.entity';

@Entity('products') // Creates table named 'products'
export class Product {
  // Primary key - Auto-generated UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Product name/title
  @Column()
  name: string;

  // Product description - can be long text
  @Column({ type: 'text', nullable: true })
  description: string;

  // Product price - using decimal for accurate currency representation
  // precision: 10 digits total, scale: 2 decimal places (e.g., 99999999.99)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Stock quantity - how many items available
  @Column({ default: 0 })
  stock: number;

  // Product category (e.g., 'Electronics', 'Clothing', 'Food')
  @Column({ nullable: true })
  category: string;

  // Category relationship
  @ManyToOne(() => Category, category => category.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  categoryEntity: Category;

  @Column({ nullable: true })
  categoryId: string;

  // Product images - stored as JSON array of URLs
  // Example: ["url1.jpg", "url2.jpg"]
  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  // Store that owns this product - Many products belong to one store
  // onDelete: 'CASCADE' means when a store is deleted, all its products are automatically deleted
  @ManyToOne(() => Store, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  // Store ID - Foreign key to stores table
  @Column()
  storeId: string;

  // Is product available for sale
  @Column({ default: true })
  isAvailable: boolean;

  // Product weight in kg (for shipping calculations)
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  // Timestamp - automatically set when product is created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp - automatically updated whenever product is modified
  @UpdateDateColumn()
  updatedAt: Date;
}
