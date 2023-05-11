import { ObjectId } from "mongoose";

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
export type getBlogsQueryType = {
  term: string,
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