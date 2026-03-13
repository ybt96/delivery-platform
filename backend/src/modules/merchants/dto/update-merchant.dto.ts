import {
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 更新商家 DTO
 */
export class UpdateMerchantDto {
  @ApiProperty({ description: '店铺名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '分类ID', required: false })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: '店铺简介', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '店铺Logo', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ description: '店铺横幅图', required: false })
  @IsString()
  @IsOptional()
  banner?: string;

  @ApiProperty({ description: '店铺地址', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: '纬度', required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ description: '经度', required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: '联系电话', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '营业时间', required: false })
  @IsString()
  @IsOptional()
  businessHours?: string;

  @ApiProperty({ description: '营业执照图片', required: false })
  @IsString()
  @IsOptional()
  licenseImg?: string;

  @ApiProperty({ description: '状态 0待审核 1正常 2违规封禁', required: false })
  @IsNumber()
  @IsOptional()
  status?: number;
}
