import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * 创建优惠券模板 DTO
 */
export class CreateCouponTemplateDto {
  @IsNumber()
  @IsOptional()
  merchantId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsEnum([1, 2, 3])
  type: number;

  @IsNumber()
  @IsOptional()
  faceValue?: number;

  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  discountRate?: number;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @IsNumber()
  @IsOptional()
  status?: number;
}

/**
 * 领取优惠券 DTO
 */
export class ReceiveCouponDto {
  @IsNumber()
  @IsNotEmpty()
  templateId: number;
}