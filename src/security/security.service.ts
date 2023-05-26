import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { SecurityRepository } from "./security.repository";
import { Types } from "mongoose";
import { Request } from "express";
import jwt from 'jsonwebtoken';
import { settingsEnv } from "../settings/settings";
import { SecurityDocument } from "./type/security.schema";
import { DevicesResDataType } from "./type/security.types";
import { idParamsValidator } from "../utils/helpers";

@Injectable()
export class SecurityService {
  constructor(protected securityRepository: SecurityRepository,
              ) {}
  async createSession(
    userId: Types.ObjectId,
    ip: string,
    deviceName: string,
  ): Promise<any> {
    const getSession = await this.securityRepository.createSession(userId, ip, deviceName,)
    if (getSession) {
      return getSession
    } else return null
  }
  async updateDateSession (userId:Types.ObjectId): Promise <boolean> {
    const date = new Date().toISOString();
    return await this.securityRepository.updateDateSession(date, userId);
  }
  async getDevices(req: Request): Promise<DevicesResDataType[] | null> {
    const userId = req.requestUser._id
    // const infoRefreshToken: any = jwt.verify(req.cookies.refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const userSessions = await this.securityRepository.findSessionsByUserId(userId);
    if (userSessions) {
      return userSessions.map((user) => (
        {
          ip: user.ip,
          title: user.deviceName,
          lastActiveDate: user.issuedDateRefreshToken,
          deviceId: user.deviceId,
        }))
    } else {
      throw new UnauthorizedException();
    }
  }

  async deleteDeviceById(deviceId: string, req: Request) {
    // const checkDeviceId = idParamsValidator(deviceId);
    // if(!checkDeviceId) throw new NotFoundException
    const session = await this.securityRepository.findSessionByDeviceId(deviceId);
    // const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    if (session && req.requestUser._id !== session.userId.toString()) {
      throw new HttpException('', HttpStatus.FORBIDDEN);}
    const terminateSession = await this.securityRepository.terminateSessionByDeviceId(deviceId);
    if (terminateSession) {throw new HttpException('', HttpStatus.NO_CONTENT)}
      throw new HttpException('', HttpStatus.NOT_FOUND);
  }
  async terminateSessionByDeviceId (deviceId: string): Promise <boolean> {
    return await this.securityRepository.terminateSessionByDeviceId(deviceId)
  }
  async deleteAllDevices(refreshToken: string) {
    const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const terminateSessions = await this.securityRepository.terminateOtherSessions(new Types.ObjectId(getRefreshToken.userId), getRefreshToken.deviceId);
    if (terminateSessions && getRefreshToken) throw new HttpException('', HttpStatus.NO_CONTENT)
    throw new HttpException('', HttpStatus.UNAUTHORIZED);
  }
}