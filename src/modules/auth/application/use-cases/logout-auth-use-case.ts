import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../jwt.service";
import { SecurityService } from "../../../security/application/security.service";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { settingsEnv } from "../../../../settings/settings";
import { SecuritySqlRepository } from '../../../security/infrastructure/security.sql-repository';

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
    protected securitySqlRepository: SecuritySqlRepository
  ) {
  }
  async execute(command: LogoutAuthCommand) {
    const refreshToken = command.req.cookies.refreshToken;
    const user = command.req.requestUser;
    const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const terminateSessions = await this.securitySqlRepository.terminateSessionByDeviceId(getRefreshToken.deviceId, user.ID);
    if (terminateSessions) {
      const expiredRefreshToken = await this.jwtService.refreshTokenToDeprecated(user, refreshToken);
      throw new HttpException("", HttpStatus.NO_CONTENT);
      if (!expiredRefreshToken) {
        throw new HttpException("", HttpStatus.NO_CONTENT);
      }
    }
  }
}