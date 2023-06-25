import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { BASIC_AUTH_KEY, IS_PUBLIC_KEY, REFRESH_TOKEN_AUTH_KEY } from "../../utils/public.decorator";
import { BasicAuthGuard } from "./basic.auth.guard";
import { settingsEnv } from "../../settings/settings";
import { Types } from "mongoose";
import { UsersRepository } from "../../modules/users/infrastructure/users.repository";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private basicAuthGuard: BasicAuthGuard,
    private usersRepository: UsersRepository
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
      // доп логика,сохранить информацию о пользователе в запросе
      return true;
    }
    const isRefreshToken = this.reflector.getAllAndOverride<boolean>(
      REFRESH_TOKEN_AUTH_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );
    if (isRefreshToken) {
        const user = await this.extractUserFromRefreshToken(request)
      if (!user) {
       throw new UnauthorizedException();
      }
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: settingsEnv.JWT_SECRET,
      });
      const user = await this.usersRepository.findUserById(new Types.ObjectId(payload.userId))
      request.requestUser = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractBasicAuthCredentials(request: Request): { username: string; password: string } | null {
    const authorizationHeader = request.headers.authorization;
    if (authorizationHeader && authorizationHeader.startsWith('Basic ')) {
      const credentials = authorizationHeader.slice('Basic '.length);
      const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
      return { username, password };
    }
    throw new UnauthorizedException();
  }
  private async extractUserFromRefreshToken(request: Request): Promise<boolean> {
    const refreshToken = request.cookies.refreshToken;
    if(!refreshToken) return false
     try {
    const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET)
       const user = await this.usersRepository.findUserById(new Types.ObjectId(getRefreshToken.userId))
       for (const token of user.authData.expirationRefreshToken) {
         if (token === refreshToken) return false
       }
       request.requestUser = user;
       return true
     } catch(err) {
       throw new UnauthorizedException();
     }
  }
}