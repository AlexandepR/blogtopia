import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { BanInfoInputClassModel, CreateBlogInputModelType, PutBlogDtoType } from "./blogsType";
import { UserDocument } from "../../users/type/users.schema";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@Schema({
  _id: false,
  versionKey: false
})
class banInfo {
  @Prop({ default: false })
  isBanned: boolean;
  @Prop()
  banDate: Date;
}

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
class BanUserInfo {
  @Prop()
  isBanned: boolean;
  @Prop()
  banDate: Date;
  @Prop()
  banReason: string;
}

@Schema({
  _id: false,
  versionKey: false
})
class BanUsersInfo {
  @Prop()
  id: Types.ObjectId;
  @Prop()
  login: string;
  @Prop({ type: BanUserInfo })
  banInfo: BanUserInfo;
}
export const BanUsersInfoSchema = SchemaFactory.createForClass(BanUsersInfo);

@Schema({ timestamps: true })
export class Blog extends TimeStamps {
  _id: Types.ObjectId;
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
  @Prop({ type: banInfo })
  banInfo: banInfo;
  @Prop({ type: BlogOwnerInfo })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop({ type: [BanUsersInfoSchema] })
  banUsersInfo: BanUsersInfo[];
  @Prop()
  isMembership: boolean;
  banBlog(banInfo: boolean) {
    this.banInfo = {
      isBanned: banInfo,
      banDate: new Date()
    };
  }
  banUser(
    dto: BanInfoInputClassModel,
    userLogin: string,
    userId: Types.ObjectId
  ) {
    const banUsersInfo = new BanUsersInfo();
    banUsersInfo.id = userId;
    banUsersInfo.login = userLogin;
    banUsersInfo.banInfo = {
      isBanned: dto.isBanned,
      banDate: new Date(),
      banReason: dto.banReason
    };
    this.banUsersInfo.push(banUsersInfo);
  }
  updateBlog(updateBlogInfo: PutBlogDtoType) {
    this.name = updateBlogInfo.name;
    this.description = updateBlogInfo.description;
    this.websiteUrl = updateBlogInfo.websiteUrl;
  }
  bindUserToBlog(user: UserDocument) {
    this.blogOwnerInfo.userId = user._id.toString();
    this.blogOwnerInfo.userLogin = user.accountData.login;
  }
  static create(
    dto: CreateBlogInputModelType,
    BlogModel: BlogModelType,
    user: UserDocument
  ): BlogDocument {
    const blog = new BlogModel();
    // blog.banUsersInfo = new BanUsersInfo();
    blog.blogOwnerInfo = {
      userId: user._id.toString(),
      userLogin: user.accountData.login
    };
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.banUsersInfo = [];
    blog.banInfo = {
      isBanned: false,
      banDate: null
    };
    return blog;
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