import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    if (!request.requestUser?.id) throw new Error('JwtGuard must be used')
    return request.requestUser.id;
  }
)
export const BASIC_AUTH_KEY = 'basicAuth';
export const BasicAuth = () => SetMetadata(BASIC_AUTH_KEY, true);

export const REFRESH_TOKEN_AUTH_KEY = 'refreshTokenAuth';
export const RefreshTokenAuthGuard = () => SetMetadata(REFRESH_TOKEN_AUTH_KEY, true);

export const UserFromRequestDecorator = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.requestUser
})