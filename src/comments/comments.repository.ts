import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostModelType } from "../posts/type/posts.schema";
import { Comment, CommentDocument, CommentModelType } from "./type/comments.schema";
import { Blog, BlogModelType } from "../blogs/type/blogs.schema";
import { Types } from "mongoose";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {
  }
  async getComments(
    postId: Types.ObjectId,
    pageSize: number,
    skip: number,
    sortBy: string,
    sortDirection: 'desc' | 'asc',
  ): Promise<CommentDocument[]> {
    const comments = await this.CommentModel
      .find()
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize);
    return comments;
  }
  async getCommentsById(commentId: Types.ObjectId): Promise<CommentDocument | null> {
    const comments = await this.CommentModel
      .findOne({ _id: commentId })
    if (comments) {
      return comments;
    } else {
      return null;
    }
  }
  async getMyStatusLikeInfo(commentId: Types.ObjectId, userId:Types.ObjectId | null | undefined): Promise<'None' | 'Like' | 'Dislike'> {
    const findLike = await this.CommentModel

      .findOne({ _id: commentId, "likesInfo.likesData": { $elemMatch: { userId: userId } } })
      .lean()
    const findDislike = await this.CommentModel
      .findOne({ _id: commentId, "likesInfo.dislikesData": { $elemMatch: { userId: userId } } })
      .lean()
    if (findLike) {
      return "Like"
    }
    if (findDislike) {
      return "Dislike"
    }
    else {
      return 'None';
    }
  }
  async getTotalCountComments(filter: any): Promise<number> {
    const count = await this.CommentModel
      .countDocuments(filter);
    return count;
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
            'likesInfo': comment.likesInfo
          }
      });
    if (updateComment) {
      return true;
    } else {
      return false;
    }
  }
  async checkLikes(commentId: Types.ObjectId, userId: Types.ObjectId, updateField:string): Promise<boolean> {
    const field = `likesInfo.${updateField}`
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