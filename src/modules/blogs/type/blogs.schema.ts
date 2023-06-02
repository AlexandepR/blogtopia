import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Model, Types, ObjectId } from "mongoose";
import {
  CreateBlogInputModelType,
  createPostForBlogInputModel,
  PutBlogDtoType,
  updatePostForBlogInputModel
} from "./blogsType";
import { PostDocument, PostModelType } from "../../posts/type/posts.schema";
import { UserDocument } from "../../users/type/users.schema";


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


@Schema()
export class Blog {
  _id: Types.ObjectId;
  // @Prop({
  //   required: true
  // })
  // author: string;
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
  createdAt: string;
  @Prop({ type: BlogOwnerInfo })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop()
  isMembership: boolean;
  updateBlog(updateBlogInfo: PutBlogDtoType) {
    this.name = updateBlogInfo.name;
    this.description = updateBlogInfo.description;
    this.websiteUrl = updateBlogInfo.websiteUrl;
    this.createdAt = new Date().toISOString();
  }
  bindUserToBlog(user:UserDocument) {
    this.blogOwnerInfo.userId = user._id.toString();
    this.blogOwnerInfo.userLogin = user.accountData.login;
  }
  // updatePostByBlog(
  //   post: PostDocument,
  //   dto: updatePostForBlogInputModel,
  //   blogId:string) {
  //   this.title = dto.title;
  //   this.shortDescription = dto.shortDescription;
  //   this.content = dto.content;
  //   this.blogId = new Types.ObjectId(dto.blogId);
  // }
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
    createNewBlog.createdAt = new Date().toISOString();
    return createNewBlog;
  }
  // static createPost(
  //   postDto: createPostForBlogInputModel,
  //   getBlog: BlogDocument,
  //   PostModel: PostModelType,
  //   user: UserDocument
  // ): PostDocument {
  //   if (!postDto) throw new Error("Bad request");
  //   const createNewPost = new PostModel();
  //   createNewPost.title = postDto.title;
  //   createNewPost.shortDescription = postDto.shortDescription;
  //   createNewPost.content = postDto.content;
  //   createNewPost.blogId = getBlog._id;
  //   createNewPost.blogName = getBlog.name;
  //   createNewPost.createdAt = new Date().toISOString();
  //   createNewPost.postOwnerInfo = {
  //     userId: user._id.toString(),
  //     userLogin: user.accountData.login
  //   };
  //   createNewPost.extendedLikesInfo = {
  //     likesData: [],
  //     dislikesData: [],
  //     likesCount: 0,
  //     dislikesCount: 0,
  //     myStatus: "None",
  //     newestLikes: []
  //   };
  //   return createNewPost;
  // }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
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