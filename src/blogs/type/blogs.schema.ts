import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Model, Types, ObjectId } from "mongoose";
import { CreateBlogInputModelType, createPostForBlogInputModel, PutBlogDtoType } from "./blogsType";
import { PostDocument, PostModelType } from "../../posts/type/posts.schema";



@Schema()
export class Blog {

  _id: Types.ObjectId;

  @Prop({
    required: true,
    maxLength: 15
  })
  name: string;

  @Prop({
    require: true,
    maxLength: 500,
  })
  description: string;

  @Prop
  ({
    require: true,
    maxLength: 100,
    match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    // default: []
  })
  websiteUrl: string;

  @Prop()
  createdAt: string;

  @Prop()
  isMembership: boolean;
  // @Prop({
  //   default: [],
  //   type: [PostSchema]
  // })
  // comments: Posts[]
  // setAge(newAge: number) {
  //   if (newAge <= 0) throw new Error("Bade age");
  //   this.age = newAge;
  // }
  updateBlog(updateBlogInfo: PutBlogDtoType) {
    this.name = updateBlogInfo.name;
    this.description = updateBlogInfo.description;
    this.websiteUrl = updateBlogInfo.websiteUrl;
  }
  // static createSuperBlog(dto: any, BlogModel: BlogModelType): BlogDocument {
  //   const createdBlog = new BlogModel(dto);
  //   createdBlog.setAge(100);
  //   return createdBlog;
  // }
  static create(
    dto: CreateBlogInputModelType,
    BlogModel: BlogModelType
  ): BlogDocument {
    const createNewBlog = new BlogModel();

    createNewBlog.name = dto.name;
    createNewBlog.description = dto.description;
    createNewBlog.websiteUrl = dto.websiteUrl;
    createNewBlog.isMembership = false;
    createNewBlog.createdAt = new Date().toISOString();

    return createNewBlog;
  }
  static createPost(
    postDto: createPostForBlogInputModel,
    getBlog: BlogDocument,
    PostModel: PostModelType
  ): PostDocument {
    if (!postDto) throw new Error("Bad request");
    const createNewPost = new PostModel();
    createNewPost.title = postDto.title;
    createNewPost.shortDescription = postDto.shortDescription;
    createNewPost.content = postDto.content;
    createNewPost.blogId = getBlog._id;
    createNewPost.blogName = getBlog.name;
    createNewPost.createdAt = new Date().toISOString();
    createNewPost.extendedLikesInfo = {
      // _id: new Types.ObjectId,
      likesData: [],
      dislikesData: [],
      likesCount: 0,
      dislikesCount: 0,
      myStatus: "None",
      newestLikes: []
    };
    return createNewPost;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog
};
const blogStaticMethods: BlogModelStaticType = {
  create: Blog.create
};
BlogSchema.statics = blogStaticMethods;
export type BlogModelStaticType = {
  create: (
    dto: CreateBlogInputModelType,
    BlogModel: BlogModelType
  ) => BlogDocument
}
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType