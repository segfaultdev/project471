/**
 * Store Entity - Defines the database table structure for stores/vendors
 * This represents the 'stores' table in PostgreSQL
 * A store can have multiple products (One-to-Many relationship)
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stores') // Creates table named 'stores'
export class Store {
  // Primary key - Auto-generated UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Store name - unique across all stores
  @Column({ unique: true })
  name: string;

  // Store slug - unique URL-friendly identifier
  @Column({ unique: true, nullable: true })
  slug: string;

  // Store description
  @Column({ type: 'text', nullable: true })
  description: string;

  // Store owner/manager - references User table
  // Many stores can belong to one user
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // Owner ID - Foreign key to users table
  @Column()
  ownerId: string;

  // Store address
  @Column({ nullable: true })
  address: string;

  // Store phone number
  @Column({ nullable: true })
  phone: string;

  // Store email
  @Column({ nullable: true })
  email: string;

  // Store logo URL
  @Column({ nullable: true })
  logo: string;

  // Store banner/cover image URL
  @Column({ nullable: true })
  banner: string;

  // Store rating - average rating from customers (0-5)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  // Delivery time in days - estimated delivery timeframe
  @Column({ type: 'int', default: 3 })
  deliveryDays: number;

  // Is store active/approved
  @Column({ default: true })
  isActive: boolean;

  // Timestamp - automatically set when store is created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp - automatically updated whenever store is modified
  @UpdateDateColumn()
  updatedAt: Date;
}
