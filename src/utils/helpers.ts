import { QueryType } from "../blogs/type/blogsType";
import { ParamsUsersType, QueryUsersPaginator } from "../users/type/usersTypes";
import * as bcrypt from "bcrypt";
import { User } from "../users/type/users.schema";
import { PostLikesType } from "../posts/type/postsType";
import { PostDocument } from "../posts/type/posts.schema";
import { ObjectId, Types } from "mongoose";

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
    filter = { "accountData.login": { $regex: query.searchLoginTerm, $options: "i" } };
  }
  if (query.searchEmailTerm) {
    filter = { "accountData.email": { $regex: query.searchEmailTerm, $options: "i" } };
  }
  if (query.searchLoginTerm && query.searchEmailTerm) {
    filter = {
      $or: [
        { "accountData.login": { $regex: query.searchLoginTerm, $options: "i" } },
        { "accountData.email": { $regex: query.searchEmailTerm, $options: "i" } }
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

// export class UserHelper {
//   static async checkIfUserExistsByEmail(email: string): Promise<boolean> {
//     const findUserByEmail = await UserModel.findOne({
//       'accountData.email': email,
//     }).lean();
//
//     return !!findUserByEmail;
//   }
// }

export const generateHash = async (password: string) => {
  const passwordSalt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, passwordSalt);
  return hash;
};

export const isPasswordCorrect = async (password: string, hash: string) => {
  const isEqual = await bcrypt.compare(password, hash);
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
export const idParamsValidator = (id: string): Types.ObjectId => {
  try {
    return new Types.ObjectId(id);
  } catch (err) {
    return null
  }
}
export const sortNewestLikesForPost = (post) => {
  return post.extendedLikesInfo.likesData.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 3).map(({ _id, createdAt, userId, userLogin }) => ({
    addedAt: createdAt,
    userId: userId.toString(),
    login: userLogin
  }))
}
