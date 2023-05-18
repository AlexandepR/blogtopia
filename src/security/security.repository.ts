import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../blogs/type/blogs.schema";
import { Post, PostModelType } from "../posts/type/posts.schema";
import { Security, SecurityDocument, SecurityModelType } from "./type/security.schema";
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
    const getSession = await Security.createSession(userId,ip,deviceName, this.SecurityModel)
    getSession.save()
    if (getSession) {
      return getSession
    } else return null
  }
  async updateDateSession(issuedDate: string, userId:Types.ObjectId): Promise<boolean> {
    const updateDateSession = await this.SecurityModel
      .updateOne({ userId: userId }, { $set: { issuedDateRefreshToken: issuedDate } });
    return updateDateSession.matchedCount === 1;
  }

}