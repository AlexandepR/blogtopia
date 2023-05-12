import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument, BlogModelType } from "./type/blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBlogInputModelType, createPostForBlogInputModel } from "./type/blogsType";
import { ObjectId } from "mongodb";
import { Post, PostModelType } from "../posts/type/posts.schema";

@Injectable()
export class BlogsRepository {
  constructor(
    // @InjectModel(Blog.name, Post.name)
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType
  ) {
  }
  async getBlogs(
    skip: number,
    pageSize: number,
    // filter: Record<string, any>,    /// Check
    //Filter<BlogDBType>,
    // filter: FilterBlogType,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Promise<BlogDocument[]> {
    const blogs = await this.BlogModel
      .find(filter,
        {
          _id: 0,
          // "isMembership": 0,
          // "__v": 0,
          id: "$_id",
          "name": 1,
          "description": 1,
          "websiteUrl": 1,
          "createdAt": 1,
          "isMembership": 1
        }
      )
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize);
    return blogs;
  }
  async create(createDto: CreateBlogInputModelType): Promise<Blog> {
    const newBlog = Blog.create(createDto, this.BlogModel);
    // const newBlog = this.BlogModel.create(createDto, this.BlogModel);
    return newBlog.save();
  }
  async createPost(postDto: createPostForBlogInputModel, getBlog: BlogDocument): Promise<Post> {
    const postForBlog = Blog.createPost(postDto, getBlog, this.PostModel);
    // const newBlog = this.BlogModel.create(createDto, this.BlogModel);
    return postForBlog.save();
  }
  async findBlogById(blogId: ObjectId): Promise<BlogDocument> {
    const blog = this.BlogModel
      .findOne({ _id: blogId });
    // .lean()
    return blog;
  }
  async save(blog: BlogDocument) {
    return await blog.save();
  }
  // async getTotalCountBlogs(filter: Filter<BlogDBType>): Promise<number> {
  async getTotalCountBlogs(filter: any): Promise<number> {
    const count = await this.BlogModel
      .countDocuments(filter);
    return count;
  }
  async delete(id: ObjectId): Promise<boolean> {
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