import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsDecimal, IsInt, IsIn } from 'class-validator';

/**
 * 创建代购订单 DTO
 */
export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  villagerName: string;

  @IsString()
  @IsPhoneNumber('CN')
  @IsNotEmpty()
  villagerPhone: string;

  @IsString()
  @IsNotEmpty()
  villagerAddress: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['淘宝', '拼多多', '京东', '其他'])
  platform: string;

  @IsString()
  @IsOptional()
  productLink: string;

  @IsDecimal({ decimal_digits: '2' })
  productPrice: number;

  @IsInt()
  @IsOptional()
  quantity: number;

  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  serviceFee: number;

  @IsString()
  @IsOptional()
  productImage: string;

  @IsInt()
  @IsOptional()
  @IsIn([0, 1])
  pickupMethod: number;

  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  deliveryFee: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['现金', '微信转账', '记账'])
  paymentMethod: string;

  @IsString()
  @IsOptional()
  remark: string;
}