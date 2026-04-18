/**
 * User Entity - Defines the database table structure for users
 * This class represents the 'users' table in PostgreSQL
 * TypeORM will automatically create/update this table based on these decorators
 */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

/**
 * UserRole Enum - Defines allowed user roles
 * This ensures only valid roles can be assigned
 * Database will store as string, but TypeScript enforces the values
 */
export enum UserRole {
  CUSTOMER = 'customer',   // Regular customer/buyer
  VENDOR = 'vendor',       // Store owner/seller
  SUPERUSER = 'superuser', // Content moderator
}

@Entity('users') // Tells TypeORM this creates a table named 'users'
export class User {
  // Primary key - Auto-generated UUID (e.g., '550e8400-e29b-41d4-a716-446655440000')
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Email column with UNIQUE constraint - prevents duplicate emails
  @Column({ unique: true })
  email: string;

  // Password column - stores hashed password (never plain text)
  @Column()
  @Exclude() // IMPORTANT: This removes password from API responses for security
  password: string;

  // User's first name
  @Column()
  firstName: string;

  // User's last name
  @Column()
  lastName: string;

  // User role - uses enum for type safety
  // Only values from UserRole enum are allowed
  // Database stores as string (e.g., 'customer', 'admin')
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  // Timestamp - automatically set when user is created
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
