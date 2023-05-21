import { QueryType } from "../blogs/type/blogsType";
import { ParamsUsersType, QueryUsersPaginator } from "../users/type/usersTypes";
import * as bcrypt from "bcrypt";
import { User } from "../users/type/users.schema";
import { PostLikesType } from "../posts/type/postsType";
import { PostDocument } from "../posts/type/posts.schema";
import { Types } from "mongoose";

export const parseQueryPaginator = (query: QueryType): QueryType => {
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
    filter = { "login": { $regex: query.searchLoginTerm, $options: "i" } };
  }
  if (query.searchEmailTerm) {
    filter = { "email": { $regex: query.searchEmailTerm, $options: "i" } };
  }
  if (query.searchLoginTerm && query.searchEmailTerm) {
    filter = {
      $or: [
        { "login": { $regex: query.searchLoginTerm, $options: "i" } },
        { "email": { $regex: query.searchEmailTerm, $options: "i" } }
      ]
    };
  }
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



export const generateHash = async (password: string) => {
  const passwordSalt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, passwordSalt);
  return hash;
};

export const isPasswordCorrect = (password: string, hash: string) => {
  const isEqual = bcrypt.compare(password, hash);
  return isEqual;
};

export const updateConfirmInfo = (user: User, code: string) => {
  const isCode = user.emailConfirmation.confirmationCode === code;
  const isDate = user.emailConfirmation.expirationDate > new Date();
  return isCode && isDate && !user.emailConfirmation.isConfirmed;
};

export const commentResData = (comments) => {
  const commentsData = comments.map((
    {
      _id, content,
      commentatorInfo: { userId, userLogin },
      createdAt, likesInfo, __v, ...rest
    }) => (
    {
      id: _id.toString(),
      content: content,
      commentatorInfo: {
        userId: userId.toString(),
        userLogin: userLogin
      },
      createdAt: createdAt,
      likesInfo: {
        likesCount: likesInfo.likesCount,
        dislikesCount: likesInfo.dislikesCount,
        myStatus: likesInfo.myStatus
      }
    }));
  return commentsData;
};
export const updatePostLikesInfo = (post: PostDocument, likeStatus: string, newLikesData?: PostLikesType) => {
  if (newLikesData) {
    if (likeStatus === 'Like'){
      post!.extendedLikesInfo.likesData.push(newLikesData)
    }
    if(likeStatus === 'Dislike') {
      post!.extendedLikesInfo.dislikesData.push(newLikesData)
    }
  };
  post!.extendedLikesInfo.likesCount = post!.extendedLikesInfo.likesData.length;
  post!.extendedLikesInfo.dislikesCount = post!.extendedLikesInfo.dislikesData.length;
  return post
}
export const idParamsValidator = (id: string) => {
  try {
    new Types.ObjectId(id);
  } catch (err) {
    return null
  }
}