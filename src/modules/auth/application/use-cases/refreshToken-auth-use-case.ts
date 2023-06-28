import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../jwt.service";
import { SecurityService } from "../../../security/application/security.service";
import { Request } from "express";
import { SecuritySqlRepository } from '../../../security/infrastructure/security.sql-repository';

export class RefreshTokenAuthCommand {
  constructor(
    public req: Request,
  ) {}
}

@CommandHandler(RefreshTokenAuthCommand)
export class RefreshTokenAuthUseCase implements ICommandHandler<RefreshTokenAuthCommand> {
  constructor(
    protected jwtService: JwtService,
    protected securitySqlRepository: SecuritySqlRepository,
  ) {
  }
  async execute(command: RefreshTokenAuthCommand) {
    const refreshToken = command.req.cookies.refreshToken;
    const user = command.req.requestUser
    const date = new Date().toISOString();
    const updateRefreshToken = await this.jwtService.updateRefreshToken(refreshToken);
    const getDeviceId = await this.jwtService.deviceIdByRefreshToken(refreshToken)
    if (user && updateRefreshToken) {
      await this.securitySqlRepository.updateDateSession(date, getDeviceId);
      await this.jwtService.refreshTokenToDeprecated(user, refreshToken);
      const token = await this.jwtService.сreateJWT(user);
      const refreshTokenCookie = `refreshToken=${updateRefreshToken}; HttpOnly; Secure`;
      // const refreshTokenCookie = `refreshToken=${updateRefreshToken}`;
      return { refreshTokenCookie, token };
    }
    throw new UnauthorizedException()
  }

}