import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsDecimal,
  IsDateString,
} from 'class-validator';

/**
 * 创建订单 DTO
 */
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNo: string;

  @IsNumber()
  @IsNotEmpty()
  merchantId: number;

  @IsNumber()
  @IsNotEmpty()
  addressId: number;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  payAmount: number;

  @IsNumber()
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsNumber()
  @IsOptional()
  payType?: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsDateString()
  @IsOptional()
  appointmentTime?: Date;

  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}

/**
 * 创建订单商品明细 DTO
 */
export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsOptional()
  productImg?: string;

  @IsString()
  @IsOptional()
  specName?: string;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;
}

/**
 * 更新订单 DTO
 */
export class UpdateOrderDto {
  @IsNumber()
  @IsOptional()
  status?: number;

  @IsNumber()
  @IsOptional()
  delivererId?: number;

  @IsDateString()
  @IsOptional()
  payTime?: Date;

  @IsString()
  @IsOptional()
  cancelReason?: string;
}