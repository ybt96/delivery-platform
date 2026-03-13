import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * 创建配送任务 DTO
 */
export class CreateDeliveryTaskDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  @IsOptional()
  delivererId?: number;

  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsString()
  @IsNotEmpty()
  deliverAddress: string;

  @IsNumber()
  @IsOptional()
  pickupLat?: number;

  @IsNumber()
  @IsOptional()
  pickupLng?: number;

  @IsNumber()
  @IsOptional()
  deliverLat?: number;

  @IsNumber()
  @IsOptional()
  deliverLng?: number;

  @IsDateString()
  @IsOptional()
  appointmentTime?: Date;

  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 更新配送任务 DTO
 */
export class UpdateDeliveryTaskDto {
  @IsNumber()
  @IsOptional()
  status?: number;

  @IsNumber()
  @IsOptional()
  delivererId?: number;

  @IsDateString()
  @IsOptional()
  pickupTime?: Date;

  @IsDateString()
  @IsOptional()
  deliveredTime?: Date;

  @IsString()
  @IsOptional()
  signImg?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}