// export type CreatePostInputModelType = {
//   name: string,
//   description: string,
//   websiteUrl: string,
// }
// export type PutPostInputModelType = {
//   name: string,
//   websiteUrl: string,
// }

import { parseQueryUsersPaginator } from "../../utils/helpers";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserInputClassModel {
  // @IsString()
  @Length(3, 10)
    // @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;
  @IsEmail(
    //   // {},
    //   // { message: "--incorrect email" }
  )
  email: string;
  @Length(6, 20)
  password: string;
}

export type ParamsUsersType = {
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string,
  searchLoginTerm: string,
  searchEmailTerm: string,
}
export type QueryUsersPaginator = {
  filter: Record<string, any>,
  pageSize: number,
  pageNumber: number,
  sortDirection: "asc" | "desc",
  sortBy: string,
}

export type UserType = {
  id: string,
  login: string,
  email: string,
  createdAt: string
}
export type CreateUserInputModelType = {
  login: string,
  email: string,
  password: string,
}