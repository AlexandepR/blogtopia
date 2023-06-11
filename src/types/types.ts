// import { ObjectId, WithId } from 'mongodb';
// import { v4 as uuidv4 } from 'uuid';
// import add from 'date-fns/add';
// import { UserAccountDBMethodsType } from '../domain/UsersTypes';
// import { HydratedDocument } from 'mongoose';
//
// export type SortedBy<T> = {
//   fieldName: keyof T
//   direction: 'desc' | 'asc'
// }
// export type SentEmailType = {
//   sentDate: Date
// }
// import { createPostForBlogInputClassModel } from "../blogs/type/blogsType";
import { IsNotEmpty } from "class-validator";

export type PaginationType<T> = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: T
}
export type ParamsType = {
  searchNameTerm: string,
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string
}
export type ParamsPaginationType = {
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string
}
export class ParamsTypeClassModel {
  searchNameTerm: string
  pageSize: number
  pageNumber: number
  sortDirection: "asc" | "desc"

  sortBy: string
}