import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { DevicesResDataType } from "../../type/security.types";
import { SecurityRepository } from "../security.repository";


export class GetDevicesCommand {
  constructor(
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(GetDevicesCommand)
export class GetDevicesUseCase implements ICommandHandler<GetDevicesCommand> {
  constructor(
    protected securityRepository: SecurityRepository,
  ) {
  }
  async execute(command: GetDevicesCommand): Promise<DevicesResDataType[] | null> {
    const userId = command.user._id
    // const infoRefreshToken: any = jwt.verify(req.cookies.refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const userSessions = await this.securityRepository.findSessionsByUserId(userId);
    if (userSessions) {
      return userSessions.map((user) => (
        {
          deviceId: user.deviceId,
          ip: user.ip,
          lastActiveDate: user.issuedDateRefreshToken,
          title: user.deviceName,
        }))
    } else {
      throw new UnauthorizedException();
    }
  }
}