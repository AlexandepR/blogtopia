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
export class ParamsTypeClassModel {
  // @IsNotEmpty()
  searchNameTerm: string
  // @IsNotEmpty()
  pageSize: number
  // @IsNotEmpty()
  pageNumber: number
  // @IsNotEmpty()
  sortDirection: "asc" | "desc"
  // @IsNotEmpty()
  sortBy: string
}
//
// export type RefreshTokensMetaType = {
//   issuedDateRefreshToken: string,
//   deviceId: string,
//   userId: ObjectId,
//   ip: string | string[],
//   deviceName: string,
// }
// export type ControlAttemptCollection = {
//   // ip: string | string[],
//   ip: string | string[],
//   url: string,
//   time: Date
// }
//
// export type UserType = {
//   id: string
//   login: string
//   email: string
//   createdAt: string
//   passwordHash?: string,
//   passwordSalt?: any
// }
// export type BlogType = {
//   id: string
//   name: string
//   description: string
//   websiteUrl: string
//   createdAt: string
//   isMembership: boolean
// }
// export type LikesType = {
//   _id: ObjectId
//   createdAt: string
//   userId: ObjectId
// }
// export type CommentLikesInfoType = {
//   likesData: LikesType[]
//   dislikesData: LikesType[]
//   likesCount: number
//   dislikesCount: number
//   myStatus: 'None' | 'Like' | 'Dislike'
// }
// export type CommentType = {
//   id: string
//   content: string
//   postId: string
//   commentatorInfo: {
//     userId: string
//     userLogin: string
//   }
//   createdAt: string
//   likesInfo: CommentLikesInfoType
// }
//
// export class CommentDBType {
//   constructor(
//     public _id: ObjectId,
//     public content: string,
//     public postId: ObjectId,
//     public commentatorInfo: {
//       userId: string,
//       userLogin: string,
//     },
//     public createdAt: string,
//     public likesInfo: CommentLikesInfoType,
//     public __v?: string,
//   ) {
//   }
// }
//
// export class UserAccountType {
//   constructor(
//     public login: string,
//     public email: string,
//     public passwordHash: string,
//     public createdAt: string
//   ) {
//   }
// }
//
// export class EmailConfirmationType {
//   constructor(
//     public confirmationCode: string,
//     public expirationDate: Date,
//     public isConfirmed: boolean,
//     public passwordRecoveryCode: string,
//     public sentEmails?: SentEmailType[]
//   ) {
//   }
// }
//
// export class RegistrationDataType {
//   constructor(
//     public ip: string | string[] | undefined,
//     public date: Date [],
//   ) {
//   }
// }
//
// export class authDataType {
//   constructor(
//     public expirationRefreshToken: string[],
//   ) {
//   }
// }
//
// export class authDevicesSessionsType {
//   constructor(
//     public ip: string[],
//     public deviceId: string[],
//     public title: string[],
//     public lastActiveDate: string[],
//     public expirationTokenDate: string[],
//   ) {
//   }
// }
//
// export class UserAccountDBType {
//   constructor(
//     public _id: ObjectId,
//     public accountData: UserAccountType,
//     public emailConfirmation: EmailConfirmationType,
//     public registrationData: RegistrationDataType,
//     public authData: authDataType,
//     public authDevicesSessions: authDevicesSessionsType,
//   ) {
//   }
// }
//
// export class BlogDBType {
//   constructor(
//     public _id: ObjectId,
//     public name: string,
//     public description: string,
//     public websiteUrl: string,
//     public createdAt: string,
//     public isMembership: boolean,
//     public __v?: string,
//   ) {
//   }
// }
// export type PostsTypeFiltered = Omit<PostsType, 'extendedLikesInfo'> &
//   { extendedLikesInfo: Omit<PostLikesInfoType, 'likesData' | 'dislikesData'> };
// export type PostsNewestLikesType = {
//   _id?: ObjectId
//   addedAt: string
//   userId: string
//   login: string
// }
// export type PostLikesType = {
//   _id: ObjectId
//   createdAt: string
//   userId: ObjectId
//   userLogin: string
// }
// export type PostLikesInfoType = {
//   likesData: PostLikesType[]
//   dislikesData: PostLikesType[]
//   likesCount: number
//   dislikesCount: number
//   myStatus: 'None' | 'Like' | 'Dislike'
//   newestLikes: PostsNewestLikesType[]
// }
// export type PostsType = {
//   id: string
//   title: string
//   shortDescription: string
//   content: string
//   blogId: string
//   blogName: string
//   createdAt: string
//   extendedLikesInfo: PostLikesInfoType
// }
//
// export class PostsDBType {
//   constructor(
//     public _id: ObjectId,
//     public title: string,
//     public shortDescription: string,
//     public content: string,
//     public blogId: ObjectId,
//     public blogName: string,
//     public createdAt: string,
//     public extendedLikesInfo: PostLikesInfoType,
//     public __v?: string
//   ) {
//   }
// }
//
// export type RefreshTokensMetaTypeDBType = RefreshTokensMetaType & {
//   _id: ObjectId
// }
//
// export type ControlAttemptCollectionDBType = ControlAttemptCollection & {
//   _id: ObjectId
// }
//
// export const HTTP_STATUSES = {
//   OK_200: 200,
//   CREATED_201: 201,
//   NO_CONTENT_204: 204,
//
//   BAD_REQUEST_400: 400,
//   UNAUTHORIZED_401: 401,
//   FORBIDDEN_403: 403,
//   NOT_FOUND_404: 404,
// };
//
//
// // export type UserDBType = Omit<UserType, 'id'> & {
// //     _id: ObjectId
// //     __v: string
// // }
// // export type PostsDBType = Omit<PostsType, 'blogId' | 'id'> & {
// //     _id: ObjectId,
// //     blogId: ObjectId
// //     __v?: string
// // }
// // export type CommentDBType = Omit<CommentType, 'id' | 'postId' | 'userId'> & {
// //     _id: ObjectId
// //     postId: ObjectId
// //     userId: ObjectId
// //     __v?: string
// // }
// // export type authDataType = {
// //     expirationRefreshToken: string[],
// // }
// // export type authDevicesSessionsType = {
// //     ip: string[],
// //     deviceId: string[],
// //     title: string[],
// //     lastActiveDate: string[],
// //     expirationTokenDate: string[],
// // }
// // export type EmailConfirmationType = {
// //     confirmationCode: string
// //     expirationDate: Date
// //     isConfirmed: boolean
// //     passwordRecoveryCode: string
// //     sentEmails?: SentEmailType[]
// // }
// // export type UserAccountDBType = WithId<{
// //     accountData: UserAccountType
// //     emailConfirmation: EmailConfirmationType
// //     registrationData: RegistrationDataType
// //     authData: authDataType
// //     authDevicesSessions: authDevicesSessionsType
// // }>
// // export type BlogDBType = WithId<{
// //     name: string
// //     description: string
// //     websiteUrl: string
// //     createdAt: string
// //     __v?: string
// // }>
// export type blogsDataType<T> = {
//   pagesCount: number,
//   page: number,
//   pageSize: number,
//   totalCount: number,
//   items: T
// }
// // export type BlogItemType = {
// //     name: string
// //     description: string
// //     websiteUrl: string
// // }
// // export type BlogDBType = WithId<{
// //     name: string
// //     description: string
// //     websiteUrl: string
// //     createdAt: string
// // }>
// // export type UserAccountType = {
// //     login: string,
// //     email: string,
// //     passwordHash: string,
// //     createdAt: string
// // }