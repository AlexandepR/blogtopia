// export type CreatePostInputModelType = {
//   name: string,
//   description: string,
//   websiteUrl: string,
// }
// export type PutPostInputModelType = {
//   name: string,
//   websiteUrl: string,
// }

import { IsEmail, IsString, Length } from "class-validator";
import { CheckConfirmData } from "../../pipes/validation/validate.pipe";


export class CreateUserInputClassModel {
  @CheckConfirmData()
  @Length(3, 10)
  @IsString()
  login: string;

  @CheckConfirmData()
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
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