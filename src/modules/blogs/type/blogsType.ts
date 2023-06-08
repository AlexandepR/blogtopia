import { ObjectId } from "mongoose";
import { IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";
import { Transform } from "class-transformer";


export class BlogInputClassModel {
  @MaxLength(15)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
    // @ValidateInputBlog()
  name: string;
  @MaxLength(500)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
    // @ValidateInputBlog()
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
export class createPostForBlogInputClassModel {
  @MaxLength(30)
  // @IsString()
  @Transform(({ value }) => value.trim())
  // @IsNotEmpty()
  title: string;
  @MaxLength(100)
  // @IsString()
  // @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  shortDescription: string;
  @MaxLength(1000)
  // @IsString()
  // @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  content: string;
}


export class BlogDBType {
  constructor(
    public _id: ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public __v?: string,
  ) {
  }
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
  searchNameTerm: string,
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string
}
export type QueryUsersType = {
  // filter?: Record<string, any>,
  // searchLoginTerm?: string,
  // searchEmailTerm?: string,
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
export type FilterBlogType = {
  name?: {
    $regex: string | number;
    $options: string;
  }
}