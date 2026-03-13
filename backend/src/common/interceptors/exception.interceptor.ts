import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * 统一异常过滤拦截器
 * 捕获所有未处理的异常并返回统一格式
 */
@Injectable()
export class ExceptionsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        return throwError(() => {
          // Nest 内置异常
          if (error.getResponse && error.getStatus) {
            const response = error.getResponse();
            return {
              code: error.getStatus ? error.getStatus() : 500,
              message: response.message || error.message || '服务器错误',
              data: null,
            };
          }

          // 其他异常
          return {
            code: 500,
            message: error.message || '服务器错误',
            data: null,
          };
        });
      }),
    );
  }
}
