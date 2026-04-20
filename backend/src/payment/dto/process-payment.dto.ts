import { IsString, IsNumber, IsOptional, Min, Matches } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @Matches(/^\d{16}$/, { message: 'Card number must be 16 digits' })
  cardNumber: string;

  @IsString()
  cardHolderName: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry date must be in MM/YY format' })
  expiryDate: string;

  @IsString()
  @Matches(/^\d{3}$/, { message: 'CVV must be 3 digits' })
  cvv: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}
