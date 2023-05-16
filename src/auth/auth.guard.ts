
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';
import { BASIC_AUTH_KEY, IS_PUBLIC_KEY } from "./decorators/public.decorator";
import { BasicAuthGuard } from "./guards/basic.auth.guard";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private basicAuthGuard: BasicAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const requiresBasicAuth = this.reflector.getAllAndOverride<boolean>(
      BASIC_AUTH_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );
    if (requiresBasicAuth) {
      const { username, password } = this.extractBasicAuthCredentials(request);
      const basicAuthResult = await this.basicAuthGuard.validate(username, password);
      if (!basicAuthResult) {
        throw new UnauthorizedException();
      }
      // доп логика,
      // сохранить информацию о пользователе в запросе
      return true;
    }


    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractBasicAuthCredentials(request: Request): { username: string; password: string } {
    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader && authorizationHeader.startsWith('Basic ')) {
      const base64Credentials = authorizationHeader.slice('Basic '.length);
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      return { username, password };
    }
    return { username: '', password: '' };
  }
}