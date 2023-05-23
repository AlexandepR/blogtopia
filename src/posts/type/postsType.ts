import { ObjectId, Types } from "mongoose";
import { IsIn, IsString } from "class-validator";

export type PostsTypeFiltered = Omit<PostsType, 'extendedLikesInfo'> &
  { extendedLikesInfo: Omit<PostExtendedLikesInfoType, 'likesData' | 'dislikesData'> };
export type outputPostModelType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: Types.ObjectId
  blogName: string
  createdAt: string
  extendedLikesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: "None" | "Like" | "Dislike"
    newestLikes: {
      addedAt: string
      userId: Types.ObjectId
      login: string
    }[]
  }
}
export type PostsNewestLikesType = {
  _id?: Types.ObjectId
  description: string
  addedAt: string
  // userId: string
  userId: Types.ObjectId
  login: string
}
export type PostLikesType = {
  _id: Types.ObjectId
  createdAt: string
  userId: Types.ObjectId
  userLogin: string
}
export type PostExtendedLikesInfoType = {
  likesData: PostLikesType[]
  dislikesData: PostLikesType[]
  likesCount: number
  dislikesCount: number
  myStatus: 'None' | 'Like' | 'Dislike'
  newestLikes: PostsNewestLikesType[]
}
export type PostsType = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: Types.ObjectId
  blogName: string
  createdAt: string
  extendedLikesInfo: PostExtendedLikesInfoType
}
export type CreatePostInputModelType = {
  title: string
  shortDescription: string
  content: string
  blogId: string
}
export type PutPostInputModelType = {
  title: string
  shortDescription: string
  content: string
  blogId: string
}
export type likeStatusType = {
  likeStatus: "None" | "Like" | "Dislike"
}

export class likeStatusClass {
  @IsString()
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: "None" | "Like" | "Dislike"
}