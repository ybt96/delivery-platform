import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsLatitude, IsLongitude, IsIn } from 'class-validator';

/**
 * 创建服务站 DTO
 */
export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;

  @IsString()
  @IsPhoneNumber('CN')
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['自有房屋', '小卖部', '快递点', '其他'])
  type: string;

  @IsString()
  @IsOptional()
  serviceArea: string;

  @IsString()
  @IsNotEmpty()
  businessHours: string;
}