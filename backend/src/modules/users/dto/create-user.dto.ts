import {
  IsString,
  IsNotEmpty,
  IsMobilePhone,
  Length,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../../common/constants/roles';

/**
 * 创建用户 DTO
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string;

  @IsMobilePhone('zh-CN')
  phone: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  realName?: string;

  @IsString()
  @IsOptional()
  @Length(18, 18)
  idCard?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum([0, 1, 2])
  @IsOptional()
  gender?: number;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

/**
 * 更新用户 DTO
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(2, 50)
  username?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  realName?: string;

  @IsString()
  @IsOptional()
  @Length(18, 18)
  idCard?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum([0, 1, 2])
  @IsOptional()
  gender?: number;

  @IsEnum([0, 1])
  @IsOptional()
  status?: number;

  @IsEnum([0, 1])
  @IsOptional()
  isVerified?: number;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}