import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * 认证服务
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 用户注册
   * @param createUserDto 注册信息
   */
  async register(createUserDto: CreateUserDto) {
    // 检查手机号是否已注册
    const existingUser = await this.usersService.findByPhone(
      createUserDto.phone,
    );
    if (existingUser) {
      throw new HttpException('手机号已注册', HttpStatus.BAD_REQUEST);
    }

    // 验证短信验证码
    const isCodeValid = await this.verifySmsCode(
      createUserDto.phone,
      createUserDto.smsCode,
    );
    if (!isCodeValid) {
      throw new HttpException('短信验证码错误', HttpStatus.BAD_REQUEST);
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建用户
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // 生成JWT Token
    const payload = {
      userId: user.id,
      username: user.username,
      role: 'consumer', // 默认角色为消费者
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret') || 'default-secret',
        expiresIn: this.configService.get('jwt.expiresIn') || '7d',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.refreshSecret') || 'default-refresh-secret',
        expiresIn: this.configService.get('jwt.refreshExpiresIn') || '30d',
      }),
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: 'consumer',
      },
    };
  }

  /**
   * 用户登录
   * @param loginDto 登录信息
   */
  async login(loginDto: LoginDto) {
    const { phone, password, smsCode } = loginDto;
    let user;

    // 短信登录
    if (smsCode) {
      const isCodeValid = await this.verifySmsCode(phone, smsCode);
      if (!isCodeValid) {
        throw new HttpException('短信验证码错误', HttpStatus.BAD_REQUEST);
      }
      user = await this.usersService.findByPhone(phone);
    }
    // 密码登录
    else {
      user = await this.usersService.findByPhone(phone);
      if (!user) {
        throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
      }

      if (!password) {
        throw new HttpException('密码不能为空', HttpStatus.BAD_REQUEST);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
      }
    }

    // 生成JWT Token
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role || 'consumer',
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret') || 'default-secret',
        expiresIn: this.configService.get('jwt.expiresIn') || '7d',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.refreshSecret') || 'default-refresh-secret',
        expiresIn: this.configService.get('jwt.refreshExpiresIn') || '30d',
      }),
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role || 'consumer',
      },
    };
  }

  /**
   * 刷新Token
   * @param user 用户信息
   */
  async refreshToken(user: any) {
    const payload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.secret') || 'default-secret',
        expiresIn: this.configService.get('jwt.expiresIn') || '7d',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.refreshSecret') || 'default-refresh-secret',
        expiresIn: this.configService.get('jwt.refreshExpiresIn') || '30d',
      }),
    };
  }

  /**
   * 发送短信验证码
   * @param phone 手机号
   */
  async sendSmsCode(phone: string) {
    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: 实际发送短信验证码
    // 这里只是模拟，实际应调用短信服务API

    // 存储到Redis，5分钟过期
    // await this.cacheManager.set(`sms_code:${phone}`, code, 300000);

    // 开发环境返回验证码，生产环境不应返回
    if (this.configService.get('app.env') === 'development') {
      return {
        message: '验证码已发送（开发环境直接返回）',
        code,
        phone,
      };
    }

    return {
      message: '验证码已发送，请注意查收',
      phone,
    };
  }

  /**
   * 验证短信验证码
   * @param phone 手机号
   * @param code 验证码
   */
  private async verifySmsCode(phone: string, code: string): Promise<boolean> {
    // TODO: 从Redis获取验证码并验证
    // const storedCode = await this.cacheManager.get(`sms_code:${phone}`);
    // if (!storedCode || storedCode !== code) {
    //   return false;
    // }
    // await this.cacheManager.del(`sms_code:${phone}`);
    // return true;

    // 开发环境直接验证通过
    if (this.configService.get('app.env') === 'development') {
      return true;
    }

    // 生产环境应实现实际验证逻辑
    return code === '123456'; // 临时返回，应替换为实际验证
  }
}