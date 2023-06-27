import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { DevicesResDataType } from "../../type/security.types";
import { SecurityRepository } from "../../infrastructure/security.repository";
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { FindUserType } from '../../../users/type/usersTypes';


export class GetDevicesCommand {
  constructor(
    public user: FindUserType,
  ) {
  }
}

@CommandHandler(GetDevicesCommand)
export class GetDevicesUseCase implements ICommandHandler<GetDevicesCommand> {
  constructor(
    protected securitySqlRepository: SecuritySqlRepository,
  ) {
  }
  async execute(command: GetDevicesCommand): Promise<DevicesResDataType[] | null> {
    const userId = command.user.ID
    // const infoRefreshToken: any = jwt.verify(req.cookies.refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const userSessions = await this.securitySqlRepository.findSessionsByUserId(userId);
    if (userSessions) {
      return userSessions.map((user, i) => ({
        deviceId: user.deviceId,
        ip: user.ip,
        lastActiveDate: user.lastActiveDate,
        title: user.title,
      }));
    } else {
      throw new UnauthorizedException();
    }
  }
}