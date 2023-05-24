import { Types } from "mongoose";
import { IsIn, IsMongoId, IsNotEmpty, isNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { existingBlog } from "../../pipes/validation/validate.pipe";

// export class likeStatusClass {
//   @IsIn(['None', 'Like', 'Dislike'])
//   likeStatus: "None" | "Like" | "Dislike"
// }

export class CreatePostInputClassModel {
  @MaxLength(30)
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  title: string;
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  shortDescription: string;
  @MaxLength(1000)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  content: string;
  @IsString()
  @IsMongoId()
  @existingBlog()
  @IsNotEmpty()
  blogId: string;
}
export class likeStatusInputClassModel {
  @IsNotEmpty()
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string
}


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
