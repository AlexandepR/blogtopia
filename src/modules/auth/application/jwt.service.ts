import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../users/infrastructure/users.repository";
import { settingsEnv } from "../../../settings/settings";
import * as jwt from 'jsonwebtoken';
import { UserDocument } from "../../users/domain/entities/users.schema";
import { Types } from "mongoose";
import { Request } from "express";
import { UserType } from '../../users/type/usersTypes';
import { UsersSqlRepository } from '../../users/infrastructure/users.sql-repository';

@Injectable()
export class JwtService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersSqlRepository: UsersSqlRepository
  ) {
  }
  async сreateJWT(user: UserType) {
    const token = jwt.sign(
      {userId: user.ID},
      settingsEnv.JWT_SECRET,
      {expiresIn: settingsEnv.JWT_TOKEN_LIFE})
    return {
      token: token
    }
  }
  async createRefreshToken(user: UserType, deviceId: string) {
    const refreshToken = jwt.sign(
      {userId: user.ID, deviceId},
      settingsEnv.JWT_REFRESH_TOKEN_SECRET,
      {expiresIn: settingsEnv.JWT_REFRESH_TOKEN_LIFE}
    )
    return refreshToken
  }
  async getUserByRefreshToken(refreshToken: string) {
    try {
      const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET)
      return await this.usersRepository.findUserById(new Types.ObjectId(getRefreshToken.userId))
    } catch (error) {
      return null
    }
  }
  async getUserIdByToken(token: string): Promise<Types.ObjectId | null> {
    try {
      const result: any = jwt.verify(token, settingsEnv.JWT_SECRET)
      return new Types.ObjectId(result.userId)
    } catch (error) {
      return null
    }
  }
  async findUserIdByAuthHeaders(req: Request): Promise<Types.ObjectId | null> {
    if (!req.headers['authorization']) return null
    const token = req.headers['authorization'].split(' ')[1]
    if (token) {
      const userId = this.getUserIdByToken(token);
      if(!userId) {return null}
      return (userId)
    } else {
      return null
    }
  }
  async deviceIdByRefreshToken(refreshToken: string) {
    try {
      const getRefreshToken: any = await jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET)
      return getRefreshToken.deviceId
    } catch (error) {
      return null
    }
  }
  async updateRefreshToken(refreshToken: string) {
    try {
      const getRefreshToken: any = await jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET)
      const user = await this.usersSqlRepository.findUserById(getRefreshToken.userId)
      const oldDeviceId = getRefreshToken.deviceId
      if (user) {
        const refreshToken = jwt.sign(
          {userId: user.ID, deviceId: oldDeviceId},
          settingsEnv.JWT_REFRESH_TOKEN_SECRET,
          {expiresIn: settingsEnv.JWT_REFRESH_TOKEN_LIFE}
        )
        return refreshToken
      }
    } catch (error) {
      return null
    }
  }
  async refreshTokenToDeprecated(user: UserType, refreshToken: string):Promise<boolean> {
    try {
      const userId: string = user.ID
      await this.usersSqlRepository.addExpiredRefreshToken(userId, refreshToken)
      return true
    } catch (error) {
      return false
    }
  }
  getSessionInfoByRefreshToken(refreshToken: string) {
    try {
      return jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET)
    } catch (e) {
      return null
    }
  }
}