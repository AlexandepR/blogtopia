import { ObjectId } from "mongoose";
import { IsString, IsUrl, MaxLength } from "class-validator";
import { Transform } from "class-transformer";


export class BlogInputClassModel {
  @MaxLength(15)
  @IsString()
  @Transform(({ value }) => value.trim())
    // @ValidateInputBlog()
  name: string;
  @MaxLength(500)
  @IsString()
  @Transform(({ value }) => value.trim())
    // @ValidateInputBlog()
  description: string;
  @IsUrl()
  @Transform(({ value }) => value.trim())
  @IsString()
    // @ValidateInputBlog()
  websiteUrl: string;
}

export class createPostForBlogInputClassModel {
  @MaxLength(30)
  title: string;
  @MaxLength(100)
  shortDescription: string;
  @MaxLength(1000)
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
  createdAt: string
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
export type FilterBlogType = {
  name?: {
    $regex: string | number;
    $options: string;
  }
}