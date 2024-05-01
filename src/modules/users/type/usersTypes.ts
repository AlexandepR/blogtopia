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

export class ParamsUsersClassModel {
  pageSize: number;
  pageNumber: number;
  sortDirection: "ASC" | "DESC";
  sortBy: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  banStatus?: "all" | "banned" | "notBanned";
}

export type ParamsUsersType = {
  pageSize: number,
  pageNumber: number,
  sortDirection: "ASC" | "DESC",
  sortBy: string,
  searchLoginTerm: string,
  searchEmailTerm: string,
  banStatus?: "all" | "banned" | "notBanned"
}
export type QueryUsersPaginator = {
  filter: Record<string, any>,
  pageSize: number,
  pageNumber: number,
  sortDirection: "ASC" | "DESC",
  sortBy: string,
  banStatus: any,
}
export type CreateUserInputModelType = {
  login: string,
  email: string,
  password: string,
}

export type GetUsersOutputModelType = {
  // ID: string,
  id?: string
  login: string,
  email: string,
  createdAt: Date | string,
  confirmationCode?: string | null
  banInfo: {
    isBanned: boolean,
    banDate: Date | string,
    banReason: string
  }
}
export type GetBanUsersOutputModelType = {
  // ID: string,
  id?: string
  login: string,
  email: string,
  createdAt: Date | string,
  confirmationCode?: string | null
  banInfo: {
    isBanned: boolean,
    banDate: Date | string,
    banReason: string
  }
}
export type InfoBanStatusType = {
  isBanned: boolean;
  banReason: string
}
export type UserType = {
  ID: string;
  login: string;
  email: string;
  created_at: Date;
  passwordHash: string;
  isConfirmed: boolean;
  confirmationCode: string | null;
  expConfirmCodeDate: Date | null;
  passRecoveryCode: string | null;
  sendEmails: string[] | null;
  expRefreshToken: string[] | null;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string | null;
  };
  devicesSession: {
    ip: string | null;
    deviceId: string | null;
    title: string | null;
    lastActiveDate: string | null;
    expirationTokenDate?: string | null;
  }[];
}
export type UserOutputModelType = {
  ID: string;
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expConfirmCodeDate: Date;
  passRecoveryCode: string | null;
  sendEmails: string[] | null;
}
export type GetBanUserForBlog = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
}
