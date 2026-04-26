/**
 * ReviewsController - Handles review HTTP endpoints
 * All routes are prefixed with '/reviews'
 * 
 * Available endpoints:
 * POST /reviews - Create a review (verified purchasers only)
 * GET /reviews/product/:productId - Get all reviews for a product
 * GET /reviews/:id - Get a single review
 * PATCH /reviews/:id - Update a review (author only)
 * DELETE /reviews/:id - Delete a review (author only)
 * GET /reviews/product/:productId/rating - Get average rating for a product
 */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  /**
   * POST /reviews - Create a review
   * Requires authentication and verified purchase
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  /**
   * GET /reviews/product/:productId - Get all reviews for a product
   * Public endpoint
   */
  @Public()
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  /**
   * GET /reviews/product/:productId/rating - Get average rating
   * Public endpoint
   */
  @Public()
  @Get('product/:productId/rating')
  async getAverageRating(@Param('productId') productId: string) {
    return this.reviewsService.getAverageRating(productId);
  }

  /**
   * GET /reviews/user/product/:productId - Get user's review for a product
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/product/:productId/status')
  async getUserReviewStatus(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.getUserReviewStatus(user.id, productId);
  }

  /**
   * GET /reviews/user/product/:productId - Get user's review for a product
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/product/:productId')
  async getUserReview(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.getUserReviewForProduct(user.id, productId);
  }

  /**
   * GET /reviews/:id - Get a single review
   * Public endpoint
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  /**
   * PATCH /reviews/:id - Update a review
   * Requires authentication and ownership
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.id, updateReviewDto);
  }

  /**
   * DELETE /reviews/:id - Delete a review
   * Requires authentication and ownership
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.remove(id, user.id);
  }
}
