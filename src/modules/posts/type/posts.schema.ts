import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, ObjectId, Types } from "mongoose";
import {
  CreatePostInputModelType,
  PostExtendedLikesInfoType,
  PostLikesType,
  PostsNewestLikesType,
  PutPostInputModelType
} from "./postsType";
import { BlogDocument } from "../../blogs/type/blogs.schema";
import { UserDocument } from "../../users/type/users.schema";


@Schema({
  _id: false,
  versionKey: false
})
class PostOwnerInfo {
  @Prop()
  userId: string;
  @Prop()
  userLogin: string;
}

@Schema()
export class PostLikesData {
  _id: Types.ObjectId;
  createdAt: string;
  userId: Types.ObjectId;
  userLogin: string;
}
@Schema()
export class NewestLikes {
  _id: Types.ObjectId;
  description: string;
  addedAt: string;
  userId: Types.ObjectId;
  login: string;
}
@Schema({
  _id: false,
  versionKey: false,
})
export class ExtendedLikesInfo {
  @Prop({ type: PostLikesData })
  likesData: PostLikesData[];
  @Prop({ type: PostLikesData })
  dislikesData: PostLikesData[];
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: "None" | "Like" | "Dislike";
  @Prop({
    type: NewestLikes
  })
  newestLikes: NewestLikes[];
}

@Schema({
  versionKey: false,
})
export class Post {
  _id: Types.ObjectId;
  @Prop({
    required: true,
    maxlength: 30
  })
  title: string;
  @Prop({
    required: true,
    maxlength: 100
  })
  shortDescription: string;
  @Prop({
    required: true,
    maxlength: 1000
  })
  content: string;
  @Prop({
    required: true
  })
  blogId: Types.ObjectId;
  @Prop({
    required: true
  })
  blogName: string;
  @Prop({
  })
  createdAt: string;
  @Prop({ type: PostOwnerInfo })
  postOwnerInfo: PostOwnerInfo;

  @Prop({ type: ExtendedLikesInfo })
  extendedLikesInfo: ExtendedLikesInfo;

  updatePost(dto: PutPostInputModelType) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = new Types.ObjectId(dto.blogId);
  }

  static create(
    dto: CreatePostInputModelType,
    blog: BlogDocument,
    user: UserDocument,
    PostModel: PostModelType,
  ): PostDocument {
    const createNewPost = new PostModel();
    createNewPost.title = dto.title;
    createNewPost.shortDescription = dto.shortDescription;
    createNewPost.content = dto.content;
    createNewPost.blogId = new Types.ObjectId(dto.blogId);
    createNewPost.blogName = blog.name;
    createNewPost.createdAt = new Date().toISOString();
    createNewPost.postOwnerInfo = {
      userId: user.id.toString(),
      userLogin: user.accountData.login
    };
    createNewPost.extendedLikesInfo = {
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

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  updatePost: Post.prototype.updatePost
};
const postStaticMethods: PostModelStaticType = {
  create: Post.create
};
PostSchema.statics = postStaticMethods;
export type PostModelStaticType = {
  create: (
    dto: CreatePostInputModelType,
    blog: BlogDocument,
    user: UserDocument,
    PostModel: PostModelType,
    ) => PostDocument
}
export type PostDocument = HydratedDocument<Post>
export type PostModelType = Model<PostDocument> & PostModelStaticType