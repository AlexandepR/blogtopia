import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { LikesType } from "./commentsType";
import { Post, PostDocument, PostModelStaticType, PostModelType } from "../../posts/type/posts.schema";
import { CreatePostInputModelType } from "../../posts/type/postsType";
import { BlogDocument } from "../../blogs/type/blogs.schema";
import { UserDocument } from "../../users/type/users.schema";

@Schema()
export class CommentLikesData {
  _id: Types.ObjectId;
  createdAt: string;
  userId: Types.ObjectId;
  userLogin: string;
}

@Schema()
class CommentatorInfo {

  @Prop({
    required: true
  })
  userId: string;

  @Prop({
    required: true
  })
  userLogin: string;
}

@Schema()
class LikesInfo {
  @Prop({type: CommentLikesData})
  likesData: CommentLikesData[];
  @Prop({type: CommentLikesData})
  dislikesData: CommentLikesData[];
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
}

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({
    required: true
  })
  content: string;

  // @Prop({
  //   required: true
  // })

  @Prop({
    required: true
  })
  postId: string;

  @Prop({
    required: true,
    type: CommentatorInfo
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    required: true
  })
  createdAt: string;

  @Prop({
    type: LikesInfo
  })
  likesInfo: LikesInfo;

  updateComment(){

  }
  static createComment(
    content: string,
    postId: Types.ObjectId,
    CommentModel: CommentModelType,
    user: UserDocument,
  ): CommentDocument {
    const createNewComment = new CommentModel();

    createNewComment.content = content;
    createNewComment.postId = postId.toString()
    createNewComment.commentatorInfo = {
      userId: user._id.toString(),
      userLogin: user.accountData.login
    }
    createNewComment.createdAt = new Date().toISOString()
    createNewComment.likesInfo = {
      likesData: [],
      dislikesData: [],
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    }
    return createNewComment
  }

}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.methods = {
  updateComment: Comment.prototype.updateComment
}
const commentStaticMethods: CommentModelStaticType = {
  createComment: Comment.createComment
}
CommentSchema.statics = commentStaticMethods;
export type CommentModelStaticType = {
  createComment: (
    content: string,
    postId: Types.ObjectId,
    CommentModel: CommentModelType,
    user: UserDocument) => CommentDocument
}
export type CommentDocument = HydratedDocument<Comment>
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType
