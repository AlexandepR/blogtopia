// import { Request } from 'express';
// import { PaginationQueryType } from './helper-types';
// import bcrypt from 'bcrypt';
// import { v4 as uuidv4 } from 'uuid';
// import * as dotenv from 'dotenv';
// import { jwtService } from '../application/jwt-service';
// import { ObjectId } from 'mongodb';
// import { LikesType, PostLikesType, PostsDBType } from '../types/types';
//
// dotenv.config();
//
// const delay = async (ms: number): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve()
//     }, ms)
//   })
// }
//
import { PaginationQueryType } from "./helpers-type";
import { QueryType, QueryUsersType } from "../blogs/type/blogsType";
import { ParamsUsersType, QueryUsersPaginator } from "../users/type/usersTypes";

export const parseQueryPaginator = (query:QueryType): QueryType => {
  return {
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize ? +query.pageSize : 10,
    searchNameTerm: query.searchNameTerm?.toString() || null,
    sortBy: (query.sortBy || "createdAt") as string,
    sortDirection: query.sortDirection === "asc" ? "asc" : "desc"
  };
};
export const parseQueryUsersPaginator = (query: ParamsUsersType): QueryUsersPaginator => {
  let filter = {};
  if (query.searchLoginTerm) {
    filter = { 'login': { $regex: query.searchLoginTerm, $options: 'i' } };
  }
  if (query.searchEmailTerm) {
    filter = { 'email': { $regex: query.searchEmailTerm, $options: 'i' } };
  }
  if (query.searchLoginTerm && query.searchEmailTerm) {
    filter = {
      $or: [
        { 'login': { $regex: query.searchLoginTerm, $options: 'i' } },
        { 'email': { $regex: query.searchEmailTerm, $options: 'i' } }
      ]
    };
  }
  // if (query.searchLoginTerm) {
  //   filter["login"] = { $regex: query.searchLoginTerm, $options: "i" };
  // }
  //
  // if (query.searchEmailTerm) {
  //   filter["email"] = { $regex: query.searchEmailTerm, $options: "i" };
  // }
  //
  // if (query.searchLoginTerm && query.searchEmailTerm) {
  //   filter["$or"] = [{ "login": { $regex: query.searchLoginTerm, $options: "i" } },
  //     { "email": { $regex: query.searchEmailTerm, $options: "i" } }];
  // }
  return {
    filter: filter,
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize ? +query.pageSize : 10,
    sortBy: (query.sortBy || "createdAt") as string,
    sortDirection: query.sortDirection === "asc" ? "asc" : "desc"
  };
};

export const pagesCounter = (totalCount: number, pageSize: number) => Math.ceil(totalCount / pageSize);

export const skipPage = (pageNumber: number, pageSize: number) => (pageNumber - 1) * pageSize;

// export const updatePostLikesInfo = (post: PostsDBType, likeStatus: string, newLikesData?: PostLikesType) => {
//   if (newLikesData) {
//     if (likeStatus === 'Like'){
//       post!.extendedLikesInfo.likesData.push(newLikesData)
//     }
//     if(likeStatus === 'Dislike') {
//       post!.extendedLikesInfo.dislikesData.push(newLikesData)
//     }
//   };
//   post!.extendedLikesInfo.likesCount = post!.extendedLikesInfo.likesData.length;
//   post!.extendedLikesInfo.dislikesCount = post!.extendedLikesInfo.dislikesData.length;
//   return post
// }
// // export const generateHashSalt = async (): Promise<string> => {
// //     const salt_base = process.env.Hash_SALT_BASE || '54321';
// //     return await bcrypt.genSalt(+salt_base);
// // }
//
// export const findUserIdByAuthHeaders = (req:Request) => {
//   const token = req.headers.authorization?.split(' ')[1]
//   if (token) {
//     const userId = jwtService.getUserIdByToken(token);
//     if(!userId) {return null}
//     return (userId)
//   } else {
//     return null
//   }
// };
//
// // export const getDeviceInfo = (req: Request) => {
// //     return {
// //         ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
// //         title: req.headers['user-agent'],
// //     }
// // }
//
//
//
//
//
//
//
//
//
//
//
// // export const parseUserViewModel = (user: UserEntityWithIdType): UserViewModelDto => {
// //     return {
// //         id: user.id,
// //         login: user.login,
// //         email: user.email,
// //         createdAt: user.createdAt,
// //     }
// // }
//
// // export const getConfirmationEmailExpirationDate = () => add(
// //     newDate(),
// //     {[CONFIRM_EMAIL_LIFE_PERIOD.units]: CONFIRM_EMAIL_LIFE_PERIOD.amount}
// // );
// // export const getRecoveryPasswordCodeExpirationDate = () => add(
// //     new Date(),
// //     {[RECOVERY_PASSWORD_CODE_LIFE_PERIOD.units]: RECOVERY_PASSWORD_CODE_LIFE_PERIOD.amount}
// // );
// // export const get CookieRefreshTokenExpire = () => add(
// //
// // );