import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreatePostInputModelType } from "./postsType";
import { BlogDocument } from "../../blogs/type/blogs.schema";


@Schema()

// export class ExtendedLikesInfoSchema = SchemaFactory(NewestLikes)
// class NewestLikes {
//   @Prop({
//     default: []
//   })
//   _id: Types.ObjectId;
//   description: string;
//   addedAt: string;
//   userId: string;
//   login: string;
// }
//
// class PostLikesData {
//   @Prop({
//     default: []
//   })
//   _id: Types.ObjectId;
//   createdAt: string;
//   userId: Types.ObjectId;
//   userLogin: string;
// }
// class ExtendedLikesInfo {
//   @Prop()
//   likesData: PostLikesData[];
//   dislikesData: PostLikesData[];
//   likesCount: number;
//   dislikesCount: number;
//   myStatus: "None" | "Like" | "Dislike";
//   newestLikes: NewestLikes[];
//   // newestLikes: Array <{
//   //   _id: Types.ObjectId;
//   //   description: string;
//   //   addedAt: string;
//   //   userId: string;
//   //   login: string;
//   // }>,
// }

export class Post {

  _id: Types.ObjectId;

  @Prop({
    required: true
  })
  title: string;

  @Prop({
    required: true
  })
  shortDescription: string;

  @Prop({
    required: true
  })
  content: string;

  @Prop({
    required: true
  })
    // blogId: Types.ObjectId;
  blogId: string;

  @Prop({
    required: true
  })
  blogName: string;

  @Prop({
    required: true
  })
  createdAt: string;

  @Prop({
    // type: ExtendedLikesInfoSchema
  })
    // extendedLikesInfo: ExtendedLikesInfo;
  extendedLikesInfo: {
    likesData: Array<{
      _id: Types.ObjectId;
      createdAt: string;
      userId: Types.ObjectId;
      userLogin: string;
    }>;
    dislikesData: Array<{
      _id: Types.ObjectId;
      createdAt: string;
      userId: Types.ObjectId;
      userLogin: string;
    }>;
    likesCount: number;
    dislikesCount: number;
    myStatus: "None" | "Like" | "Dislike";
    newestLikes: Array<{
      _id: Types.ObjectId;
      createdAt: string;
      userId: Types.ObjectId;
      userLogin: string;
    }>;
  };

  updatePost() {
  }

  static createStaticPost(
    dto: CreatePostInputModelType,
    blog: BlogDocument,
    PostModel: PostModelType
  ): PostDocument {
    if (!dto) throw new Error("Bad request");
    const createNewPost = new PostModel();
    createNewPost.title = dto.title;
    createNewPost.shortDescription = dto.shortDescription;
    createNewPost.content = dto.content;
    createNewPost.blogId = dto.blogId;
    createNewPost.blogName = blog.name;
    createNewPost.createdAt = new Date().toISOString();
    createNewPost.extendedLikesInfo = {
      likesData: [],
      dislikesData: [],
      likesCount: 0,
      dislikesCount: 0,
      myStatus: "None",
      newestLikes: []
    };

    // extendedLikesInfo: {
    //   likesData: [{
    //     _id: Types.ObjectId,
    //     createdAt: string,
    //     userId: Types.ObjectId,
    //     userLogin: string
    //   }],
    //     dislikesData;
    // :
    //   [{
    //     _id: Types.ObjectId,
    //     createdAt: string,
    //     userId: Types.ObjectId,
    //     userLogin: string
    //   }],
    //     likesCount;
    // :
    //   number;
    //   dislikesCount: number;
    //   myStatus: "None" | "Like" | "Dislike";
    //   newestLikes: {
    //     description: string;
    //     addedAt: string;
    //     userId: string;
    //     login: string;
    //   }
    // }

    return createNewPost;
  }

}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.methods = {
  updatePost: Post.prototype.updatePost
};
const postStaticMethods: PostModelStaticType = {
  createStaticPost: Post.createStaticPost
};
PostSchema.statics = postStaticMethods;
export type PostModelStaticType = {
  createStaticPost: (dto: CreatePostInputModelType, blog: BlogDocument, PostModel: PostModelType) => PostDocument
}
export type PostDocument = HydratedDocument<Post>
export type PostModelType = Model<PostDocument> & PostModelStaticType