import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../jwt.service";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { settingsEnv } from "../../../../settings/settings";
import { SecurityOrmRepository } from "../../../security/infrastructure/security.orm-repository";

export class LogoutAuthCommand {
  constructor(
    public req: Request
  ) {
  }
}

@CommandHandler(LogoutAuthCommand)
export class LogoutAuthUseCase implements ICommandHandler<LogoutAuthCommand> {
  constructor(
    protected jwtService: JwtService,
    protected securityOrmRepository: SecurityOrmRepository
  ) {
  }
  async execute({ req }: LogoutAuthCommand) {
    const refreshToken = req.cookies.refreshToken;
    const user = req.requestUser;
    const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const terminateSessions = await this.securityOrmRepository.terminateSessionByDeviceId(getRefreshToken.deviceId, user.ID);
    if (terminateSessions) {
      const expiredRefreshToken = await this.jwtService.refreshTokenToDeprecated(user, refreshToken);
      if (!expiredRefreshToken) {
        throw new HttpException("", HttpStatus.BAD_REQUEST);
      }
    }
    return new HttpException("", HttpStatus.NO_CONTENT)
  }
}