import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { DevicesResDataType } from "../../type/security.types";
import { SecurityRepository } from "../security.repository";
import jwt from "jsonwebtoken";
import { settingsEnv } from "../../../../settings/settings";
import { Types } from "mongoose";


export class DeleteAllDevicesCommand {
  constructor(
    public refreshToken: any,
  ) {
  }
}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommand> {
  constructor(
    protected securityRepository: SecurityRepository,
  ) {
  }
  async execute(command: DeleteAllDevicesCommand) {
    const getRefreshToken: any = jwt.verify(command.refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const terminateSessions = await this.securityRepository.terminateOtherSessions(new Types.ObjectId(getRefreshToken.userId), getRefreshToken.deviceId);
    if (terminateSessions && getRefreshToken) throw new HttpException('', HttpStatus.NO_CONTENT)
    throw new HttpException('', HttpStatus.UNAUTHORIZED);
  }
}