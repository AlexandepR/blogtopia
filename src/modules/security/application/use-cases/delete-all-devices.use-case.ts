import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { settingsEnv } from '../../../../settings/settings';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';


export class DeleteAllDevicesCommand {
  constructor(
    public refreshToken: any,
  ) {
  }
}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommand> {
  constructor(
    protected securitySqlRepository: SecuritySqlRepository,
  ) {
  }
  async execute(command: DeleteAllDevicesCommand) {
    const getRefreshToken: any = jwt.verify(command.refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const terminateSessions = await this.securitySqlRepository.terminateOtherSessions(getRefreshToken.userId, getRefreshToken.deviceId);
    if (terminateSessions && getRefreshToken) throw new HttpException('', HttpStatus.NO_CONTENT)
    throw new HttpException('', HttpStatus.UNAUTHORIZED);
  }
}