import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument, BlogModelStaticType, BlogModelType } from "./type/blogs.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { BlogDBType, CreateBlogInputModelType, FilterBlogType, PutBlogDtoType } from "./type/blogsType";
import { Filter, ObjectId } from "mongodb";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType) {
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
          id: "$_id"
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
  async findBlogById(blogId: ObjectId): Promise<BlogDocument> {
    const blog = this.BlogModel
      .findOne({ _id: blogId });
    // .lean()
    return blog;
  }
  async save(blog: BlogDocument) {
    await blog.save();
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