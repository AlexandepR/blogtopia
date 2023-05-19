import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    if (!request.user?.id) throw new Error('JwtGuard must be used')
    return request.user.id;
  }
)
export const BASIC_AUTH_KEY = 'basicAuth';
export const BasicAuth = () => SetMetadata(BASIC_AUTH_KEY, true);

export const REFRESH_TOKEN_AUTH_KEY = 'refreshTokenAuth';
export const RefreshTokenAuthGuard = () => SetMetadata(REFRESH_TOKEN_AUTH_KEY, true);
