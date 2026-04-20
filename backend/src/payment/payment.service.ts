import { Injectable } from '@nestjs/common';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentService {
  /**
   * Fake payment gateway for testing
   * In production, integrate with real payment providers like Stripe, PayPal, etc.
   */
  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<any> {
    const { amount, cardNumber, cardHolderName, expiryDate, cvv, orderId } = processPaymentDto;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fake validation - reject if card number starts with '0000'
    if (cardNumber.startsWith('0000')) {
      return {
        success: false,
        message: 'Payment declined - Invalid card',
        transactionId: null,
        orderId
      };
    }

    // Fake validation - reject if CVV is '000'
    if (cvv === '000') {
      return {
        success: false,
        message: 'Payment declined - Invalid CVV',
        transactionId: null,
        orderId
      };
    }

    // Generate fake transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Simulate successful payment
    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId,
      orderId,
      amount,
      cardLast4: cardNumber.slice(-4),
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionId: string): Promise<any> {
    // In real implementation, verify with payment gateway
    return {
      transactionId,
      status: 'verified',
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string, amount: number): Promise<any> {
    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      success: true,
      message: 'Refund processed successfully',
      refundId,
      transactionId,
      amount,
      refundedAt: new Date().toISOString()
    };
  }
}
