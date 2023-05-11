import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PostModelType } from "../posts/type/posts.schema";
import { CommentDocument, CommentModelType } from "./type/comments.schema";
import { Blog, BlogModelType } from "../blogs/type/blogs.schema";

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private PostModel: PostModelType,
    private CommentModel: CommentModelType,
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