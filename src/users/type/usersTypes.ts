// export type CreatePostInputModelType = {
//   name: string,
//   description: string,
//   websiteUrl: string,
// }
// export type PutPostInputModelType = {
//   name: string,
//   websiteUrl: string,
// }

import { IsEmail, IsString, Length, registerDecorator, Validate, ValidationOptions } from "class-validator";
import {
  IsLoginOrEmailAlreadyExists,
  IsLoginOrEmailAlreadyExistsPipe
} from "../../pipes/validation/validate-user-login.pipe";



export class CreateUserInputClassModel {
  @IsLoginOrEmailAlreadyExists()
  @Length(3, 10)
  @IsString()
  login: string;

  @IsLoginOrEmailAlreadyExists()
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