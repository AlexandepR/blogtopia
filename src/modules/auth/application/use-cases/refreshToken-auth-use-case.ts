import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../jwt.service";
import { Request } from "express";
import { SecurityOrmRepository } from "../../../security/infrastructure/security.orm-repository";

export class RefreshTokenAuthCommand {
  constructor(
    public req: Request
  ) {
  }
}

@CommandHandler(RefreshTokenAuthCommand)
export class RefreshTokenAuthUseCase implements ICommandHandler<RefreshTokenAuthCommand> {
  constructor(
    protected jwtService: JwtService,
    protected securityOrmRepository: SecurityOrmRepository
  ) {
  }
  async execute({ req: { cookies, requestUser } }: RefreshTokenAuthCommand) {
    const refreshToken = cookies.refreshToken;
    const user = requestUser;
    const date = new Date().toISOString();
    const updateRefreshToken = await this.jwtService.updateRefreshToken(refreshToken);
    const getDeviceId = await this.jwtService.deviceIdByRefreshToken(refreshToken);
    if (user && updateRefreshToken) {
      await this.securityOrmRepository.updateDateSession(date, getDeviceId);
      await this.jwtService.refreshTokenToDeprecated(user, refreshToken);
      const token = await this.jwtService.createJWT(user);
      const refreshTokenCookie = `refreshToken=${updateRefreshToken}; HttpOnly; Secure`;
      // const refreshTokenCookie = `refreshToken=${updateRefreshToken}`;
      return { refreshTokenCookie, token };
    }
    throw new UnauthorizedException();
  }

}