import { Request } from "express";
import { SecurityService } from "./security.service";
import { Controller, Delete, Get, Param, Req } from "@nestjs/common";
import { RefreshTokenAuthGuard } from "../utils/public.decorator";

console.log("security----Controller")
@Controller("security")
export class SecurityController {
  constructor(
    protected securityService: SecurityService
  ) {
  }
  @RefreshTokenAuthGuard()
  @Get("/devices")
  async getDevices(
    @Req() req: Request
  ) {
    console.log('------/devices-----');
    return await this.securityService.getDevices(req);
  }
  @RefreshTokenAuthGuard()
  @Delete("/devices/:deviceId")
  async deleteDeviceById(
    @Req() req: Request,
    @Param("deviceId")
      deviceId: string
  ) {
    return await this.securityService.deleteDeviceById(deviceId, req);
  }
  @RefreshTokenAuthGuard()
  @Delete('/devices')
  async deleteAllDevices(
    @Req() req: Request,
  ) {
    return await this.securityService.deleteAllDevices(req.cookies.refreshToken)
  }
}