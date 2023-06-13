import { ObjectId } from "mongoose";
import { IsNotEmpty, IsString, IsUrl, Length, MaxLength, MinLength, minLength } from "class-validator";
import { Transform } from "class-transformer";


export class BlogInputClassModel {
  @MaxLength(15)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  name: string;
  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description: string;
  @IsUrl()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  @IsString()
    // @ValidateInputBlog()
  websiteUrl: string;
}
export class updatePostForBlogInputClassModel {
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
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  blogId: string
}
export class PostForBlogBloggerInputClassModel {
  @MaxLength(30)
  @Transform(({ value }) => value.trim())
  title: string
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  shortDescription: string
  @MaxLength(1000)
  @Transform(({ value }) => value.trim())
  content: string
}
export class BanInfoInputClassModel {
  @IsNotEmpty()
  isBanned: boolean
  @MinLength(20)
  banReason: string
  @IsNotEmpty()
  blogId: string
}
export class BanInfoBlogInputClassModel {
  @IsNotEmpty()
  isBanned: boolean
}

export type BlogType = {
  id: string
  name: string
  description: string
  websiteUrl: string
  createdAt: Date
  isMembership: boolean
}
export type QueryType = {
  searchNameTerm?: string,
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string
}
export type CreateBlogInputModelType = {
  name: string,
  description: string,
  websiteUrl: string,
}
export type PutBlogDtoType = {
  name: string,
  description: string,
  websiteUrl: string,
}
export type createPostForBlogInputModel = {
  title: string,
  shortDescription: string,
  content: string
}
export type updatePostForBlogInputModel = {
  title: string,
  shortDescription: string,
  content: string
}
