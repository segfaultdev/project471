/**
 * Category Entity - Defines the database table structure for product categories
 * This represents the 'categories' table in PostgreSQL
 * A category can have multiple products (One-to-Many relationship)
 * A category belongs to one store (Many-to-One relationship)
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories') // Creates table named 'categories'
export class Category {
  // Primary key - Auto-generated UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Category name (e.g., 'Electronics', 'Clothing', 'Food')
  @Column()
  name: string;

  // Category slug - unique URL-friendly identifier
  @Column({ unique: true, nullable: true })
  slug: string;

  // Category description
  @Column({ type: 'text', nullable: true })
  description: string;

  // Store that owns this category - Many categories belong to one store
  @ManyToOne(() => Store, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  // Store ID - Foreign key to stores table
  @Column()
  storeId: string;

  // Products in this category - One category has many products
  @OneToMany(() => Product, (product) => product.category, { cascade: true })
  products: Product[];

  // Timestamp when category was created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp when category was last updated
  @UpdateDateColumn()
  updatedAt: Date;
}
