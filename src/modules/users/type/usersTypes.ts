// export type CreatePostInputModelType = {
//   name: string,
//   description: string,
//   websiteUrl: string,
// }
// export type PutPostInputModelType = {
//   name: string,
//   websiteUrl: string,
// }

import { IsBoolean, IsEmail, IsString, Length, MinLength } from "class-validator";
import { CheckConfirmData } from "../../../pipes/validation/validate.pipe";
import { Transform } from "class-transformer";

export class InfoBanStatusClassModel {
  @IsBoolean()
  isBanned: boolean;
  @IsString()
  @MinLength(20)
  @Transform(({ value }) => value.trim())
  banReason: string
}

export class CreateUserInputClassModel {
  @CheckConfirmData()
  @Length(3, 10)
  @IsString()
  @Transform(({ value }) => value.trim())
  login: string;

  @CheckConfirmData()
  @IsEmail()
  @IsString()
  @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  @Length(6, 20)
  @Transform(({ value }) => value.trim())
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

export type GetUsersOutputModelType = {
  id: string,
  login: string,
  email: string,
  createdAt: string,
  banInfo: {
    isBanned: boolean,
    banDate: Date,
    banReason: string
  }
}