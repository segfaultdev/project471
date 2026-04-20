import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { productId, quantity } = addToCartDto;

    // Check if product exists and has enough stock
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Only ${product.stock} items available in stock`);
    }

    // Check if item already in cart
    const existingItem = await this.cartItemsRepository.findOne({
      where: { userId, productId }
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(`Only ${product.stock} items available in stock`);
      }
      existingItem.quantity = newQuantity;
      return await this.cartItemsRepository.save(existingItem);
    }

    // Create new cart item
    const cartItem = this.cartItemsRepository.create({
      userId,
      productId,
      quantity
    });

    return await this.cartItemsRepository.save(cartItem);
  }

  async getCart(userId: string): Promise<CartItem[]> {
    return await this.cartItemsRepository.find({
      where: { userId },
      relations: ['product', 'product.store'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, userId },
      relations: ['product']
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException(`Only ${cartItem.product.stock} items available in stock`);
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return await this.cartItemsRepository.save(cartItem);
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, userId }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemsRepository.remove(cartItem);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartItemsRepository.delete({ userId });
  }

  async getCartTotal(userId: string): Promise<{ subtotal: number; itemCount: number }> {
    const cartItems = await this.getCart(userId);
    
    const subtotal = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price.toString()) * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return { subtotal, itemCount };
  }
}
