import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../../blogs/domain/entities/blogs.schema";
import { Post, PostModelType } from "../../posts/domain/entities/posts.schema";
import { Security, SecurityDocument, SecurityModelType } from "../type/security.schema";
import { Types } from "mongoose";


@Injectable()
export class SecurityRepository {
  constructor(
    // @InjectModel(Blog.name, Post.name)
    @InjectModel(Security.name) private SecurityModel: SecurityModelType,
  ) {}
  async createSession(
    userId: Types.ObjectId,
    ip: string,
    deviceName: string,
  ): Promise<SecurityDocument> {
    const createSession = await Security.createSession(userId,ip,deviceName, this.SecurityModel)
    const result = await createSession.save()
    if (result) {
      return result
    } else return null
  }
  async updateDateSession(issuedDate: string, userId:Types.ObjectId): Promise<boolean> {
    const updateDateSession = await this.SecurityModel
      .updateOne({ userId: userId }, { $set: { issuedDateRefreshToken: issuedDate } });
    return updateDateSession.modifiedCount > 0;
  }
  async findSessionsByUserId(userId: Types.ObjectId): Promise<SecurityDocument[]> {
    const userSessions = await this.SecurityModel
      .find({ userId: userId })
      // .lean();
    if (userSessions) {
      return userSessions;
    } else return null;
  }
  async findSessionByDeviceId(deviceId: string): Promise<any> {
    const sessionByDeviceId = await this.SecurityModel
      .findOne({ deviceId: deviceId })
      .lean();
    if (sessionByDeviceId) {
      return sessionByDeviceId;
    } else return null;
  }
  async terminateAllSessions(userId: Types.ObjectId): Promise<boolean> {
    const terminateSessions = await this.SecurityModel
      .deleteMany({ userId: userId });
    return terminateSessions.deletedCount >= 1;
  }
  async terminateOtherSessions(userId: Types.ObjectId, deviceId: string): Promise<boolean> {
    const terminateSessions = await this.SecurityModel
      .deleteMany({ userId: userId, deviceId: { $ne: deviceId } });
    return terminateSessions.deletedCount >= 1;
  }
  async terminateSessionByDeviceId(deviceId: string): Promise<boolean> {
    const terminateSession = await this.SecurityModel
      .deleteOne({ deviceId: deviceId });
    return terminateSession.deletedCount >= 1;
  }
}