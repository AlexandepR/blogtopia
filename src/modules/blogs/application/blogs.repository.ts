import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument, BlogModelType } from "../type/blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBlogInputModelType, createPostForBlogInputModel } from "../type/blogsType";
import { ObjectId } from "mongodb";
import { Post, PostModelType } from "../../posts/type/posts.schema";
import { UserDocument } from "../../users/type/users.schema";
import { Types } from "mongoose";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType
  ) {
  }
  async getBlogs(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc",
    isAdmin?: boolean,
  ): Promise<BlogDocument[]> {
    const getBlogOwnerInfo = isAdmin ? "blogOwnerInfo" : ''
    const blogs = await this.BlogModel
      .find(filter ,
        {
          _id: 0,
          id: "$_id",
          "name": 1,
          "description": 1,
          "websiteUrl": 1,
          "createdAt": 1,
          "isMembership": 1,
        }
      )
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .select([
        "name",
        "description",
        "websiteUrl",
        "createdAt",
        "isMembership",
        `${getBlogOwnerInfo}`,
      ])
      .limit(pageSize);
    return blogs;
  }
  async createBlog(createDto: CreateBlogInputModelType, user: UserDocument): Promise<Blog> {
    const newBlog = Blog.create(createDto, this.BlogModel, user);
    return newBlog.save();
  }
  async findBlogByIdForBlogger(blogId: ObjectId,filter?): Promise<BlogDocument> {
     const query = { $and: [{ _id: blogId }, filter] };
    const blog = await this.BlogModel
      .findOne(query);
    return blog;
  }
  async findBlogById(blogId: ObjectId): Promise<BlogDocument> {
    const blog = await this.BlogModel
      .findOne({ _id: blogId });
    return blog;
  }
  async save(blog: BlogDocument) {
    return await blog.save();
  }
  async getTotalCountBlogs(filter: any): Promise<number> {
    const count = await this.BlogModel
      .countDocuments(filter);
    return count;
  }
  async deleteBlog(id: ObjectId): Promise<boolean> {
    const deleteBlog = await this.BlogModel
      .deleteOne({ _id: id });
    return !!deleteBlog;
  }
  async deleteAllBlogs(): Promise<boolean> {
    const delBlog = await this.BlogModel
      .deleteMany({});
    return delBlog.deletedCount >= 1;
  }
}