/**
 * UsersService - Business logic for user management
 * Handles all database operations for users (CRUD)
 * Also handles password hashing and validation
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    // Inject TypeORM repository for User entity
    // This gives us database methods like find(), save(), delete(), etc.
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Get all users from database
   * @returns Promise<User[]> - Array of all users
   * SQL: SELECT * FROM users
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Find a single user by their ID
   * @param id - User's UUID
   * @returns Promise<User | null> - User object or null if not found
   * SQL: SELECT * FROM users WHERE id = ?
   */
  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Find a user by their email address
   * Used during login to check if user exists
   * @param email - User's email
   * @returns Promise<User | null> - User object or null if not found
   * SQL: SELECT * FROM users WHERE email = ?
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Create a new user in the database
   * IMPORTANT: Password is hashed before saving (never store plain text passwords!)
   * @param userData - Partial user data (email, password, firstName, etc.)
   * @returns Promise<User> - The created user
   */
  async create(userData: Partial<User>): Promise<User> {
    // Hash password before saving to database
    if (userData.password) {
      // Generate salt (random data to make hash unique)
      // 10 rounds = good balance of security and performance
      const salt = await bcrypt.genSalt(10);
      
      // Hash password with salt
      // Example: 'password123' becomes '$2b$10$xyz...abc'
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Create user instance (doesn't save to DB yet)
    const user = this.usersRepository.create(userData);
    
    // Save to database and return
    // SQL: INSERT INTO users (...) VALUES (...)
    return this.usersRepository.save(user);
  }

  /**
   * Update an existing user
   * If password is being updated, it will be hashed
   * @param id - User's UUID
   * @param userData - Fields to update
   * @returns Promise<User | null> - Updated user or null if not found
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    // Hash password if it's being updated
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Update the user in database
    // SQL: UPDATE users SET ... WHERE id = ?
    await this.usersRepository.update(id, userData);
    
    // Return the updated user
    return this.findOne(id);
  }

  /**
   * Delete a user from database
   * @param id - User's UUID
   * @returns Promise<void>
   * SQL: DELETE FROM users WHERE id = ?
   */
  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  /**
   * Validate a password during login
   * Compares plain text password with hashed password from database
   * @param plainPassword - Password entered by user (e.g., 'password123')
   * @param hashedPassword - Hashed password from database (e.g., '$2b$10$xyz...')
   * @returns Promise<boolean> - true if passwords match, false otherwise
   * 
   * Example:
   *   validatePassword('password123', '$2b$10$xyz...') -> true
   *   validatePassword('wrongpass', '$2b$10$xyz...') -> false
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
