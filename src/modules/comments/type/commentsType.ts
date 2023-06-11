import { Types } from "mongoose";
import { IsString, Length } from "class-validator";
import { Transform } from "class-transformer";

export class commentContentInputClassModel {
  @Length(20, 300)
  @IsString()
  @Transform(({ value }) => value.trim())
  content: string;
}

export type LikesType = {
  _id: Types.ObjectId
  createdAt: string
  userId: Types.ObjectId
  userLogin: string
}
export type CommentLikesInfoType = {
  likesData: LikesType[]
  dislikesData: LikesType[]
  likesCount: number
  dislikesCount: number
  myStatus: "None" | "Like" | "Dislike"
}
export type CommentType = {
  id: string
  content: string
  postId: string
  commentatorInfo: {
    userId: string
    userLogin: string
  }
  createdAt: string
  likesInfo: CommentLikesInfoType
}

export type CommentReturnType = {
  id: string
  content: string
  commentatorInfo: {
    userId: string
    userLogin: string
  }
  createdAt: string
  likesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: "None" | "Like" | "Dislike"
  }
}

export type CommentDataType = {
  id: Types.ObjectId;
  content: string;
  commentatorInfo: {
    userId: string,
    userLogin: string;
  }
  createdAt: string;
  postInfo: {
    id: Types.ObjectId;
    title: string;
    blogId: Types.ObjectId;
    blogName: string;
  };
}