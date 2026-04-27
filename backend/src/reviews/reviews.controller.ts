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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Public()
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Public()
  @Get('product/:productId/rating')
  async getAverageRating(@Param('productId') productId: string) {
    return this.reviewsService.getAverageRating(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/product/:productId/status')
  async getUserReviewStatus(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.getUserReviewStatus(user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/product/:productId')
  async getUserReview(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.reviewsService.getUserReviewForProduct(user.id, productId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.id, updateReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.remove(id, user.id);
  }
}
