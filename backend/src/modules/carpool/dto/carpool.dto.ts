import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * 创建顺风车用户认证信息 DTO
 */
export class CreateCarpoolProfileDto {
  @IsNumber()
  @IsEnum([1, 2, 3])
  role: number;

  // 车主字段
  @IsString()
  @IsOptional()
  driverLicense?: string;

  @IsString()
  @IsOptional()
  licenseImg?: string;

  @IsString()
  @IsOptional()
  vehicleBrand?: string;

  @IsString()
  @IsOptional()
  vehicleColor?: string;

  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @IsString()
  @IsOptional()
  vehicleImg?: string;

  @IsNumber()
  @IsOptional()
  maxPassengers?: number;

  // 乘客字段
  @IsString()
  @IsOptional()
  specialNeeds?: string;

  // 社区认证字段
  @IsString()
  @IsOptional()
  village?: string;
}

/**
 * 创建顺风车行程 DTO
 */
export class CreateCarpoolTripDto {
  @IsString()
  @IsNotEmpty()
  village: string;

  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @IsNumber()
  @IsNotEmpty()
  fromLat: number;

  @IsNumber()
  @IsNotEmpty()
  fromLng: number;

  @IsString()
  @IsNotEmpty()
  toAddress: string;

  @IsNumber()
  @IsNotEmpty()
  toLat: number;

  @IsNumber()
  @IsNotEmpty()
  toLng: number;

  @IsDateString()
  @IsNotEmpty()
  departureTime: Date;

  @IsNumber()
  @IsNotEmpty()
  totalSeats: number;

  @IsNumber()
  @IsOptional()
  pricePerSeat?: number;

  @IsNumber()
  @IsEnum([1, 2, 3, 4])
  @IsOptional()
  tripType?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * 创建顺风车预约 DTO
 */
export class CreateCarpoolBookingDto {
  @IsNumber()
  @IsNotEmpty()
  tripId: number;

  @IsNumber()
  @IsNotEmpty()
  seats: number;

  @IsString()
  @IsOptional()
  pickupAddress?: string;

  @IsNumber()
  @IsOptional()
  pickupLat?: number;

  @IsNumber()
  @IsOptional()
  pickupLng?: number;

  @IsNumber()
  @IsEnum([1, 2, 3])
  @IsOptional()
  passengerType?: number;

  @IsString()
  @IsOptional()
  remark?: string;
}