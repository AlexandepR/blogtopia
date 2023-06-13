import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { PaginationType } from "../../../types/types";
import {
  validateObjectId,
  pagesCounter,
  parseQueryPaginator,
  skipPage,
  updateCommentLikesInfo
} from "../../../utils/helpers";
import { UsersRepository } from "../../users/application/users.repository";
import { commentContentInputClassModel, CommentType, LikesType } from "../type/commentsType";
import { JwtService } from "../../auth/application/jwt.service";
import { Request } from 'express';
import { Types } from "mongoose";
import { likeStatusInputClassModel } from "../../posts/type/postsType";
import { UserDocument } from "../../users/type/users.schema";
import { validateOrRejectModel } from "../../../utils/validation.helpers";


@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    // protected postsRepository: UsersRepository,
    protected jwtService: JwtService
  ) {
  }
  async getComment(id: Types.ObjectId, userId: Types.ObjectId) {
    // const userId = await this.jwtService.findUserIdByAuthHeaders(req);
    const commentId = new Types.ObjectId(id)
    const comment = await this.commentsRepository.getCommentsById(commentId);
    if(!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
    if (comment) {
      const getMyStatusLikeInfo = await this.commentsRepository.getMyStatusLikeInfo(commentId, userId);
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId.toString(),
          userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: getMyStatusLikeInfo,
        }
      };
    }
    return null;
  }
  // async updateComment (id: string, dto: commentContentInputClassModel, user: UserDocument) {
  //   await validateOrRejectModel(dto, commentContentInputClassModel);
  //   const commentId = validateObjectId(id);
  //   const comment = await this.commentsRepository.getCommentsById(commentId);
  //   if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
  //   // const userId = await this.jwtService.findUserIdByAuthHeaders(req);
  //   // const user = await this.commentsRepository.getCommentsById(new Types.ObjectId(commentId));
  //   // if (!user) throw new HttpException('', HttpStatus.NOT_FOUND);
  //   // if (userId.toString() !== user?.commentatorInfo.userId) throw new HttpException('', HttpStatus.FORBIDDEN);
  //   const commentIsUpdate = await this.commentsRepository.updateCommentId(new Types.ObjectId(id), dto.content);
  //   if (user._id.toString() !== comment?.commentatorInfo.userId) {
  //     throw new HttpException('', HttpStatus.FORBIDDEN)
  //   }
  //   if (commentIsUpdate) {
  //     throw new HttpException('', HttpStatus.NO_CONTENT)
  //   } else {
  //     throw new HttpException('', HttpStatus.NOT_FOUND)
  //   }
  // }
  // async updateLikeByCommentId (dto:likeStatusInputClassModel, id:string, req:Request) {
  //   await validateOrRejectModel(dto, likeStatusInputClassModel);
  //   const likeStatus = dto.likeStatus
  //   const commentId = validateObjectId(id);
  //   const userId = await this.jwtService.findUserIdByAuthHeaders(req);
  //   if (!userId) throw new HttpException('', HttpStatus.UNAUTHORIZED)
  //   const comment = await this.commentsRepository.getCommentsById(commentId);
  //   if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
  //
  //   const newLikesData: LikesType = {
  //     _id: new Types.ObjectId(),
  //     createdAt: new Date().toISOString(),
  //     userId: userId,
  //   };
  //   if (likeStatus === 'Like') {
  //     const checkDislikes = await this.commentsRepository.checkLikes(commentId, userId, 'dislikesData');
  //     if (checkDislikes) {
  //       const comment = await this.commentsRepository.getCommentsById(commentId);
  //       const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
  //       const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
  //       throw new HttpException('', HttpStatus.NO_CONTENT)
  //     }
  //     await this.commentsRepository.checkLikes(commentId, userId, 'likesData');
  //     const comment = await this.commentsRepository.getCommentsById(commentId);
  //     const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
  //     const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
  //     throw new HttpException('', HttpStatus.NO_CONTENT)
  //   }
  //   if (likeStatus === 'Dislike') {
  //     const checkLikes = await this.commentsRepository.checkLikes(commentId, userId, 'likesData');
  //     if (checkLikes) {
  //       const comment = await this.commentsRepository.getCommentsById(commentId);
  //       const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
  //       const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
  //       throw new HttpException('', HttpStatus.NO_CONTENT);
  //     }
  //     await this.commentsRepository.checkLikes(commentId, userId, 'dislikesData');
  //     const comment = await this.commentsRepository.getCommentsById(commentId);
  //     const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
  //     const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
  //     throw new HttpException('', HttpStatus.NO_CONTENT)
  //
  //   }
  //   if (likeStatus === 'None') {
  //     await this.commentsRepository.checkLikes(commentId, userId, 'dislikesData');
  //     await this.commentsRepository.checkLikes(commentId, userId, 'likesData');
  //     const comment = await this.commentsRepository.getCommentsById(commentId);
  //     comment!.likesInfo.dislikesCount = comment!.likesInfo.dislikesData.length;
  //     comment!.likesInfo.likesCount = comment!.likesInfo.likesData.length;
  //     const updateLike = await this.commentsRepository.updateLikeComment(comment!, commentId);
  //     if (updateLike) throw new HttpException('', HttpStatus.NO_CONTENT)
  //   }
  //   throw new HttpException('', HttpStatus.BAD_REQUEST)
  // }
  // async deleteCommentById(id: string, req:Request) {
  //   const commentId = validateObjectId(id);
  //   const userId = await this.jwtService.findUserIdByAuthHeaders(req);
  //   const getComment = await this.getComment(commentId, req);
  //   if (!getComment) {throw new HttpException('', HttpStatus.NOT_FOUND)}
  //   if (userId.toString() !== getComment?.commentatorInfo.userId) {
  //     throw new HttpException('', HttpStatus.FORBIDDEN)
  //   }
  //   const isDeleted = await this.commentsRepository.deleteComment(commentId);
  //   if (isDeleted) {throw new HttpException('', HttpStatus.NO_CONTENT)} else {
  //     throw new HttpException('', HttpStatus.NOT_FOUND)}}
  //
  // async deleteAllComment() {
  //   return await this.commentsRepository.deleteAllComment();
  // }
}
