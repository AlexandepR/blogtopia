import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { BanInfoInputClassModel, CreateBlogInputModelType, PutBlogDtoType } from "./blogsType";
import { UserDocument } from "../../users/type/users.schema";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";


@Schema({
  _id: false,
  versionKey: false
})
class BlogOwnerInfo {
  @Prop()
  userId: string;
  @Prop()
  userLogin: string;
}
@Schema({
  _id: false,
  versionKey: false
})
class BanUsersInfo {
  @Prop()
  isBanned: boolean;
  @Prop()
  date: Date;
  @Prop()
  banReason: string
  @Prop()
  login: string;
  @Prop()
  userId: Types.ObjectId;
}

@Schema({timestamps:true})
export class Blog extends TimeStamps{
  _id: Types.ObjectId
  @Prop({
    required: true,
    maxLength: 15
  })
  name: string;
  @Prop({
    require: true,
    maxLength: 500
  })
  description: string;
  @Prop
  ({
    require: true,
    maxLength: 100,
    match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
  })
  websiteUrl: string;
  @Prop()
  banInfo: boolean
  @Prop({ type: BlogOwnerInfo })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop( {type: BanUsersInfo})
  banUsersInfo: BanUsersInfo[];
  @Prop()
  isMembership: boolean;
  banBlog(banInfo: boolean) {
    this.banInfo = banInfo
  }
  banUser(dto: BanInfoInputClassModel, userLogin: string, userId: Types.ObjectId) {
      this.banUsersInfo.push({
        isBanned: dto.isBanned,
        date: new Date(),
        banReason: dto.banReason,
        login: userLogin,
        userId: userId,
      })
  }
  // unBanUser(dto: BanInfoInputClassModel, userLogin: string, userId: Types.ObjectId) {
  //   this.banUsersInfo.isBanned = dto.isBanned;
  //   this.banUsersInfo.date = new Date();
  //   this.banUsersInfo.banReason = dto.banReason;
  //   this.banUsersInfo.login = userLogin;
  //   this.banUsersInfo.userId = userId;
  // }
  updateBlog(updateBlogInfo: PutBlogDtoType) {
    this.name = updateBlogInfo.name;
    this.description = updateBlogInfo.description;
    this.websiteUrl = updateBlogInfo.websiteUrl;
  }
  bindUserToBlog(user:UserDocument) {
    this.blogOwnerInfo.userId = user._id.toString();
    this.blogOwnerInfo.userLogin = user.accountData.login;
  }
  static create(
    dto: CreateBlogInputModelType,
    BlogModel: BlogModelType,
    user: UserDocument
  ): BlogDocument {
    const createNewBlog = new BlogModel();
    createNewBlog.blogOwnerInfo = {
      userId: user._id.toString(),
      userLogin: user.accountData.login
    };
    createNewBlog.name = dto.name;
    createNewBlog.description = dto.description;
    createNewBlog.websiteUrl = dto.websiteUrl;
    createNewBlog.isMembership = false;
    return createNewBlog;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  banBlog: Blog.prototype.banBlog,
  banUser: Blog.prototype.banUser,
  updateBlog: Blog.prototype.updateBlog,
  bindUserToBlog: Blog.prototype.bindUserToBlog
};
const blogStaticMethods: BlogModelStaticType = {
  create: Blog.create
};
BlogSchema.statics = blogStaticMethods;
export type BlogModelStaticType = {
  create: (
    dto: CreateBlogInputModelType,
    BlogModel: BlogModelType,
    user: UserDocument
  ) => BlogDocument
}
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType