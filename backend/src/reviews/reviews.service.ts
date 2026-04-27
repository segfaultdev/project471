import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Order, OrderStatus } from '../orders/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async verifyPurchase(userId: string, productId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const completedStatuses = [
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
    ];

    const orders = await this.ordersRepository.find({
      where: {
        status: In(completedStatuses),
      },
      relations: ['customer'],
    });

    for (const order of orders) {
      const belongsToUser =
        order.customer?.id === userId ||
        order.customerInfo?.email?.toLowerCase() === user.email.toLowerCase();

      if (!belongsToUser) {
        continue;
      }

      const hasProduct = order.items.some(item => 
        item.productId.toString() === productId || item.productId === productId
      );
      if (hasProduct) {
        return true;
      }
    }

    return false;
  }

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const hasPurchased = await this.verifyPurchase(userId, createReviewDto.productId);
    
    if (!hasPurchased) {
      throw new ForbiddenException('You can only review products you have purchased');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        userId,
        productId: createReviewDto.productId,
      },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      userId,
    });

    const savedReview = await this.reviewsRepository.save(review);

    await this.updateProductRating(createReviewDto.productId);

    return savedReview;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const savedReview = await this.reviewsRepository.save(review);

    await this.updateProductRating(review.productId);

    return savedReview;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.findOne(id);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const productId = review.productId;
    await this.reviewsRepository.remove(review);

    await this.updateProductRating(productId);
  }

  private async updateProductRating(productId: string): Promise<void> {
    const ratingData = await this.getAverageRating(productId);
    
    await this.productsRepository.update(productId, {
      averageRating: ratingData.average,
      reviewCount: ratingData.count,
    });
  }

  async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .where('review.productId = :productId', { productId })
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .getRawOne();

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0', 10),
    };
  }

  async getUserReviewForProduct(userId: string, productId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({
      where: { userId, productId },
    });
  }

  async getUserReviewStatus(
    userId: string,
    productId: string,
  ): Promise<{ hasPurchased: boolean; canReview: boolean; review: Review | null }> {
    const [hasPurchased, review] = await Promise.all([
      this.verifyPurchase(userId, productId),
      this.getUserReviewForProduct(userId, productId),
    ]);

    return {
      hasPurchased,
      canReview: hasPurchased && !review,
      review,
    };
  }
}
