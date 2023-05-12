import { Types } from "mongoose";

export type LikesType = {
  _id: Types.ObjectId
  createdAt: string
  userId: Types.ObjectId
}
export type CommentLikesInfoType = {
  likesData: LikesType[]
  dislikesData: LikesType[]
  likesCount: number
  dislikesCount: number
  myStatus: 'None' | 'Like' | 'Dislike'
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