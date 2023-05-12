import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostModelType } from "../posts/type/posts.schema";
import { Comment, CommentDocument, CommentModelType } from "./type/comments.schema";
import { Blog, BlogModelType } from "../blogs/type/blogs.schema";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {
  }
  async getComments(
    skip: number,
    pageSize: number,
    // filter: Record<string, any>,    /// Check
    //Filter<BlogDBType>,
    // filter: FilterBlogType,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Promise<CommentDocument[]> {
    const comments = await this.CommentModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize);
    return comments;
  }
  async getTotalCountComments(filter: any): Promise<number> {
    const count = await this.BlogModel
      .countDocuments(filter);
    return count;
  }
}