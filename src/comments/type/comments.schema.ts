import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { LikesType } from "./commentsType";
import { Post, PostDocument, PostModelStaticType } from "../../posts/type/posts.schema";


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
  likesData: LikesType[];
  dislikesData: LikesType[];
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
}

@Schema()
export class Comment {
  _id: Types.ObjectId;

  @Prop({
    required: true
  })
  content: string;

  @Prop({
    required: true
  })

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
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = HydratedDocument<Comment>
export type CommentModelStaticType = {}
export type CommentModelType = Model<CommentDocument> & CommentModelStaticType
