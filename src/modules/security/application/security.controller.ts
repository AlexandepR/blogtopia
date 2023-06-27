import { Request } from "express";
import { SecurityService } from "./security.service";
import { Controller, Delete, Get, Param, Req } from "@nestjs/common";
import { RefreshTokenAuthGuard, UserFromRequestDecorator } from "../../../utils/public.decorator";
import { UserDocument } from "../../users/domain/entities/users.schema";
import { GetDevicesCommand } from "./use-cases/get-devices.use-case";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteDeviceByIdCommand } from "./use-cases/delete-devices-by-Id.use-case";
import { DeleteAllDevicesCommand } from "./use-cases/delete-all-devices.use-case";
import { FindUserType } from '../../users/type/usersTypes';

@Controller("security")
export class SecurityController {
  constructor(
    protected commandBus: CommandBus,
  ) {
  }
  @RefreshTokenAuthGuard()
  @Get("/devices")
  async getDevices(
    // @Req() req: Request
    @UserFromRequestDecorator() user: FindUserType,
  ) {
    const command = new GetDevicesCommand(user)
    return await this.commandBus.execute(command)
  }
  @RefreshTokenAuthGuard()
  @Delete("/devices/:deviceId")
  async deleteDeviceById(
    // @Req() req: Request,
    @UserFromRequestDecorator() user: FindUserType,
    @Param("deviceId")
      deviceId: string
  ) {
    const command = new DeleteDeviceByIdCommand(user,deviceId)
    return await this.commandBus.execute(command)
  }
  @RefreshTokenAuthGuard()
  @Delete('/devices')
  async deleteAllDevices(
    @Req() req: Request,
  ) {
    const command = new DeleteAllDevicesCommand(req.cookies.refreshToken)
    return await this.commandBus.execute(command)
  }
}