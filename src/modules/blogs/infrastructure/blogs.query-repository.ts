import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument, BlogModelType } from "../domain/blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { ObjectId } from "mongodb";
import { Post, PostModelType } from "../../posts/domain/posts.schema";

@Injectable()
export class BlogsQueryRepository {
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
    isAdmin?: boolean
  ): Promise<BlogDocument[]> {
    const getBlogOwnerInfo = isAdmin ? "blogOwnerInfo" : "";
    const getBanInfo = isAdmin ? "banInfo" : "";
    const blogs = await this.BlogModel
      .find(filter
        ,
        {
          _id: 0,
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
      .select([
        "name",
        "description",
        "websiteUrl",
        "createdAt",
        "isMembership",
        `${getBlogOwnerInfo}`,
        `${getBanInfo}`
      ])
      .limit(pageSize);
    return blogs;
  }
  async getArrayIdBanBlogs() {
    const blogs = await this.BlogModel
      .find({ "banInfo.isBanned": true });
    const arrBlogsId = blogs.map((blog) => blog._id);
    return arrBlogsId;
  }
  async getBannedUsers(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ) {
    const blogs = await this.BlogModel
      .find(filter, { _id: 0, "banUsersInfo": 1 })
      .select(["banUsersInfo"])
      .lean()
      .sort({ [`banUsersInfo.${sortBy}`]: sortDirection })
      .skip(skip)
      .limit(pageSize)
    if (blogs[0]) {
      const sortBlog = blogs[0].banUsersInfo.sort((a, b) => {
        if (sortDirection === 'asc') {
          if (a.login < b.login) {
            return -1;
          } else if (a.login > b.login) {
            return 1;
          } else {
            return 0;
          }
        } else if (sortDirection === 'desc') {
          if (a.login > b.login) {
            return -1;
          } else if (a.login < b.login) {
            return 1;
          } else {
            return 0;
          }
        }
      }).slice(0, pageSize);
      return sortBlog
    }
    return blogs
  }
  async findBlogByIdForBlogger(blogId: ObjectId, filter?): Promise<BlogDocument> {
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
  async getTotalCountBanUsersBlogs(filter: any): Promise<number> {
    const getBlogWithBanUsers = await this.BlogModel
      .find(filter);
    if (getBlogWithBanUsers[0]) {
      return getBlogWithBanUsers[0].banUsersInfo.length;
    }
    return 0;
  }
  async getTotalCountBlogs(filter: any): Promise<number> {
    const count = await this.BlogModel
      .countDocuments(filter);
    return count;
  }
}