import { ParamsUsersType, QueryUsersPaginator } from "../modules/users/type/usersTypes";
import * as bcrypt from "bcrypt";
import { User } from "../modules/users/type/users.schema";
import { PostLikesType } from "../modules/posts/type/postsType";
import { PostDocument } from "../modules/posts/type/posts.schema";
import { Types } from "mongoose";
import { CommentDocument } from "../modules/comments/type/comments.schema";
import { LikesType } from "../modules/comments/type/commentsType";
import { QueryType } from "../modules/blogs/type/blogsType";
import { HttpException, HttpStatus } from "@nestjs/common";

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
  // if (query.searchLoginTerm) {
  //   filter = { "accountData.login": { $regex: query.searchLoginTerm, $options: "i" } };
  // }
  // if (query.searchEmailTerm) {
  //   filter = { "accountData.email": { $regex: query.searchEmailTerm, $options: "i" } };
  // }
  if (query.searchLoginTerm || query.searchEmailTerm) {
    filter = {
      $or: [
        {
          "accountData.login": { $regex: `${query.searchLoginTerm}`, $options: "i" },
        },
        {
          "accountData.email": { $regex: `${query.searchEmailTerm}`, $options: "i" }
        },
      ]
    };
  }
  const banStatus = query.banStatus === 'banned' ? false : query.banStatus === 'notBanned' ? true : ''
  const banfilter = banStatus !== '' ? { "accountData.banInfo.isBanned": { $nin: banStatus }} : {}
  return {
    // "all" | "banned" | "notBanned"
    // filter: ({ "accountData.banInfo.isBanned": { $nin: true }, ...filter }),
    filter: filter,
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize ? +query.pageSize : 10,
    sortBy: (query.sortBy || "createdAt") as string,
    sortDirection: query.sortDirection === "asc" ? "asc" : "desc",
    banStatus: banfilter
  };
};

export const pagesCounter = (totalCount: number, pageSize: number) => Math.ceil(totalCount / pageSize);

export const skipPage = (pageNumber: number, pageSize: number) => (pageNumber - 1) * pageSize;

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
    if (likeStatus === "Like") {
      post!.extendedLikesInfo.likesData.push(newLikesData);
    }
    if (likeStatus === "Dislike") {
      post!.extendedLikesInfo.dislikesData.push(newLikesData);
    }
  }
  ;
  post!.extendedLikesInfo.likesCount = post!.extendedLikesInfo.likesData.length;
  post!.extendedLikesInfo.dislikesCount = post!.extendedLikesInfo.dislikesData.length;
  return post;
};
export const validateObjectId = (id: string): Types.ObjectId | null => {
  try {
    return new Types.ObjectId(id);
  } catch (err) {
    return null;
  }
};
export const sortNewestLikesForPost = (post) => {
  return post.extendedLikesInfo.likesData.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 3).map(({ _id, createdAt, userId, userLogin }) => ({
    addedAt: createdAt,
    userId: userId.toString(),
    login: userLogin
  }));
};


export const updateCommentLikesInfo = (comment: CommentDocument, likeStatus: string, newLikesData?: LikesType) => {
  if (newLikesData) {
    if (likeStatus === "Like") {
      comment!.likesInfo.likesData.push(newLikesData);
    }
    if (likeStatus === "Dislike") {
      comment!.likesInfo.dislikesData.push(newLikesData);
    }
  }
  ;
  comment!.likesInfo.likesCount = comment!.likesInfo.likesData.length;
  comment!.likesInfo.dislikesCount = comment!.likesInfo.dislikesData.length;
  return comment;
};

export const filterByNameTermOrUserLogin = (searchNameTerm: string, field: string, userLogin: string) => {
  // const findField = `${field}.userLogin`
  // const regexSearchNameTerm = searchNameTerm ? new RegExp(searchNameTerm, 'i') : '';
  //
  // return {
  //   $or: [
  //     { name: { $regex: `${searchNameTerm}`, $options: "i" }, },
  //     {
  //       // [`${field}.userLogin`] : userLogin
  //       "blogOwnerInfo.userLogin" : userLogin
  //     }],
  // };
  const findField = `${field}.userLogin`;
  const regexSearchNameTerm = searchNameTerm ? new RegExp(searchNameTerm, 'i') : '';

  if (searchNameTerm) {
    return {
      $and: [
        { name: { $regex: regexSearchNameTerm } },
        { [findField]: userLogin }
      ]
    };
  } else {
    return {
      [findField]: userLogin
    };
  }

};


export const filterBanPostsLikesInfo = (posts, banUsers) => {
  return posts.map(post => {
  if (post.extendedLikesInfo && post.extendedLikesInfo.newestLikes) {
    post.extendedLikesInfo.newestLikes = post.extendedLikesInfo.newestLikes.filter(
      like => !banUsers.includes(like.login)
    );
    post.extendedLikesInfo.likesData = post.extendedLikesInfo.likesData.filter(
      like => !banUsers.includes(like.userLogin)
    );
    post.extendedLikesInfo.dislikesData = post.extendedLikesInfo.dislikesData.filter(
      like => !banUsers.includes(like.userLogin)
    );
    post!.extendedLikesInfo.likesCount = post!.extendedLikesInfo.likesData.length;
    post!.extendedLikesInfo.dislikesCount = post!.extendedLikesInfo.dislikesData.length;
  }
  return post;
})}

export const filterBanCommentLikesInfo = (comment, banUsers) => {
  if(!comment) throw new HttpException("", HttpStatus.NOT_FOUND);
  if (comment.likesInfo) {
    comment.likesInfo.likesData = comment.likesInfo.likesData.filter(
      like => !banUsers.includes(like.userLogin)
    );
    comment.likesInfo.dislikesData = comment.likesInfo.dislikesData.filter(
      like => !banUsers.includes(like.userLogin)
    );
    comment!.likesInfo.likesCount = comment!.likesInfo.likesData.length;
    comment!.likesInfo.dislikesCount = comment!.likesInfo.dislikesData.length;
  }
  return comment;
}
// )}

export const filterBanPostLikesInfo = (post, banUsers) => {
  if(!post) throw new HttpException("", HttpStatus.NOT_FOUND);
  // return post.map(post => {
  if (post.extendedLikesInfo && banUsers) {
  // if (post.extendedLikesInfo) {
    post.extendedLikesInfo.newestLikes = post.extendedLikesInfo.newestLikes.filter(
      like => !banUsers.includes(like.login)
    );
    post.extendedLikesInfo.likesData = post.extendedLikesInfo.likesData.filter(
      like => !banUsers.includes(like.userLogin)
    );
    post.extendedLikesInfo.dislikesData = post.extendedLikesInfo.dislikesData.filter(
      like => !banUsers.includes(like.userLogin)
    );
    post!.extendedLikesInfo.likesCount = post!.extendedLikesInfo.likesData.length;
    post!.extendedLikesInfo.dislikesCount = post!.extendedLikesInfo.dislikesData.length;
  }
  return post;
}
export const findLikeStatusForPost = (post, userId) => {
  const userLike = post.extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
  const userDislike = post.extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
  return userLike ? "Like" : userDislike ? "Dislike" : "None";
}
// )
  // }