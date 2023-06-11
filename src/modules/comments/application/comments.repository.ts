import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment, CommentDocument, CommentModelType } from "../type/comments.schema";
import { Types } from "mongoose";
import { filterBanCommentLikesInfo } from "../../../utils/helpers";
import { CommentDataType } from "../type/commentsType";


@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType
  ) {
  }
  async getComments(
    postId: Types.ObjectId,
    pageSize: number,
    skip: number,
    sortBy: string,
    sortDirection: "desc" | "asc",
    filter,
    banUsers: Array<string>
  ): Promise<CommentDocument[]> {
    const comments = await this.CommentModel
      .find({ $or: [{ postId }, filter] })
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize);
    return filterBanCommentLikesInfo(comments, banUsers);
    // return comments;
  }
  async findAllOwnComments(
    skip: number,
    pageSize: number,
    sortBy: string,
    sortDirection: "desc" | "asc",
    userId: Types.ObjectId
  ): Promise<CommentDataType[]> {
    const getOwnComments = await this.CommentModel
      .find({ "commentatorInfo.userId": userId })
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize)
      .select(["_id", "content", "commentatorInfo", "createdAt", "postInfo"])
    .lean()
    const comments = getOwnComments.map(({ _id, ...rest }) => ({
      id: _id,
      ...rest
    }));
    return comments
  }
  async getCommentsById(commentId: Types.ObjectId, filter?, banUsers?): Promise<CommentDocument | null> {
    let query: any = { _id: commentId };
    if (filter) {
      query = { $and: [query, filter] };
    }
    const comments = await this.CommentModel
      .findOne(query);
    if (comments) {
      const filteredPosts = filterBanCommentLikesInfo(comments, banUsers);
      return filteredPosts;
    } else {
      return null;
    }
  }
  async getMyStatusLikeInfo(commentId: Types.ObjectId, userId: Types.ObjectId | null | undefined): Promise<"None" | "Like" | "Dislike"> {
    const findLike = await this.CommentModel

      .findOne({ _id: commentId, "likesInfo.likesData": { $elemMatch: { userId: userId } } })
      .lean();
    const findDislike = await this.CommentModel
      .findOne({ _id: commentId, "likesInfo.dislikesData": { $elemMatch: { userId: userId } } })
      .lean();
    if (findLike) {
      return "Like";
    }
    if (findDislike) {
      return "Dislike";
    } else {
      return "None";
    }
  }
  async getTotalCountComments(filter: any): Promise<number> {
    const count = await this.CommentModel
      .countDocuments(filter);
    return count;
  }
  async getTotalOwnComments(userId: Types.ObjectId): Promise<number> {
    return this.CommentModel.countDocuments({ "commentatorInfo.userId": userId });
  }
  async getTotalCount(postId: Types.ObjectId) {
    return this.CommentModel
      .count({ postId });
  }
  async updateCommentId(id: Types.ObjectId, newContent: string): Promise<boolean> {
    const updateComment = await this.CommentModel
      .updateOne({ _id: id }, { $set: { content: newContent } });
    if (updateComment) {
      return true;
    } else {
      return false;
    }
  }
  async updateLikeComment(comment: CommentDocument, commentId: Types.ObjectId): Promise<boolean> {
    const updateComment = await this.CommentModel
      .updateOne({ _id: commentId }, {
        $set:
          {
            "likesInfo": comment.likesInfo
          }
      });
    if (updateComment) {
      return true;
    } else {
      return false;
    }
  }
  async updateCommentLikesInfo(comment: CommentDocument, commentId: Types.ObjectId): Promise<boolean> {
    const updateComment = await this.CommentModel
      .updateOne({ _id: commentId }, {
        $set:
          {
            "likesInfo.likesData": comment.likesInfo.likesData,
            "likesInfo.dislikesData": comment.likesInfo.dislikesData,
            "likesInfo.likesCount": comment!.likesInfo.likesData.length,
            "likesInfo.dislikesCount": comment!.likesInfo.dislikesData.length
          }
      });
    if (updateComment) {
      return true;
    } else {
      return false;
    }
  }
  // async checkNewestLikes(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
  //   const checkNewestLikes = await this.CommentModel
  //     .updateMany(
  //       { _id: commentId },
  //       { $pull: { 'likesInfo.newestLikes': { userId: userId } } }
  //     );
  //   return checkNewestLikes.modifiedCount > 0;
  // }
  async checkLikes(commentId: Types.ObjectId, userId: Types.ObjectId, updateField: string): Promise<boolean> {
    const field = `likesInfo.${updateField}`;
    const result = await this.CommentModel
      .updateMany(
        { _id: commentId },
        { $pull: { [field]: { userId: userId } } }
      );
    return result.modifiedCount > 0;
  }
  async deleteComment(id: Types.ObjectId): Promise<boolean> {
    const isDeleted = await this.CommentModel
      .deleteOne({ _id: id });
    return isDeleted.deletedCount >= 1;
  }
  async deleteAllComment(): Promise<boolean> {
    const isDeleted = await this.CommentModel
      .deleteMany({});
    return isDeleted.deletedCount >= 1;
  }
}