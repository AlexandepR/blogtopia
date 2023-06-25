import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../../users/infrastructure/users.repository";
import { settingsEnv } from "../../../settings/settings";
import * as jwt from 'jsonwebtoken';
import { UserDocument } from "../../users/domain/entities/users.schema";
import { Types } from "mongoose";
import { Request } from "express";

@Injectable()
export class JwtService {
  constructor(
    protected usersRepository: UsersRepository
  ) {
  }
  async сreateJWT(user: UserDocument) {
    const token = jwt.sign(
      {userId: user._id},
      settingsEnv.JWT_SECRET,
      {expiresIn: settingsEnv.JWT_TOKEN_LIFE})
    return {
      token: token
    }
  }
  async createRefreshToken(user: UserDocument, deviceId: string) {
    const refreshToken = jwt.sign(
      {userId: user._id, deviceId},
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
  async updateRefreshToken(refreshToken: string) {
    try {
      const getRefreshToken: any = await jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET)
      const user = await this.usersRepository.findUserById(new Types.ObjectId(getRefreshToken.userId))
      const oldDeviceId = getRefreshToken.deviceId
      if (user) {
        const refreshToken = jwt.sign(
          {userId: user._id, deviceId: oldDeviceId},
          settingsEnv.JWT_REFRESH_TOKEN_SECRET,
          {expiresIn: settingsEnv.JWT_REFRESH_TOKEN_LIFE}
        )
        return refreshToken
      }
    } catch (error) {
      return null
    }
  }
  async refreshTokenToDeprecated(user: UserDocument, refreshToken: string):Promise<boolean> {
    try {
      const userId: Types.ObjectId = user._id
      await this.usersRepository.addExpiredRefreshToken(userId, refreshToken)
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