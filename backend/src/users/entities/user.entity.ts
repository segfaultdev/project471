import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  CUSTOMER = 'customer', // Regular customer/buyer
  VENDOR = 'vendor', // Store owner/seller
  SUPERUSER = 'superuser', // Content moderator
}

@Entity('users') // Tells TypeORM this creates a table named 'users'
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // IMPORTANT: This removes password from API responses for security
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'varchar',
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
