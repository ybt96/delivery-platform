import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * JWT 认证守卫
 * 用于验证请求中的 JWT Token
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('未提供认证token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.secret') || 'default-secret',
      });
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('token已失效或无效');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

/**
 * 角色权限守卫（待使用）
 * 检查用户是否有访问特定资源的权限
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return true;
    }

    // 检查请求路径是否匹配用户权限
    const requiredPermissions = this.getRequiredPermissions(request.path);
    const userPermissions = user.permissions || [];

    return requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    );
  }

  private getRequiredPermissions(path: string): string[] {
    // 根据路径映射所需权限
    const permissionsMap: Record<string, string[]> = {
      '/api/v1/users': ['user:manage'],
      '/api/v1/products': ['product:manage'],
      '/api/v1/orders': ['order:admin:read'],
    };

    for (const [route, perms] of Object.entries(permissionsMap)) {
      if (path.startsWith(route)) {
        return perms;
      }
    }

    return [];
  }
}
