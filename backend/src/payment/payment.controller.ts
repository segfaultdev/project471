import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  processPayment(@Body() processPaymentDto: ProcessPaymentDto) {
    return this.paymentService.processPayment(processPaymentDto);
  }

  @Get('verify/:transactionId')
  verifyPayment(@Param('transactionId') transactionId: string) {
    return this.paymentService.verifyPayment(transactionId);
  }

  @Post('refund/:transactionId')
  refundPayment(
    @Param('transactionId') transactionId: string,
    @Body('amount') amount: number
  ) {
    return this.paymentService.refundPayment(transactionId, amount);
  }
}
