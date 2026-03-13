import { IsString, IsNotEmpty, IsMobilePhone, Length } from 'class-validator';

/**
 * 用户注册 DTO
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
  @IsNotEmpty()
  @Length(6, 6)
  smsCode: string;
}

/**
 * 用户登录 DTO
 */
export class LoginDto {
  @IsMobilePhone('zh-CN')
  phone: string;

  @IsString()
  @Length(6, 20)
  password?: string;

  @IsString()
  @Length(6, 6)
  smsCode?: string;
}