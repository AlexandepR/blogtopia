import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument, BlogModelType } from "../domain/blogs.schema";
import { InjectModel } from "@nestjs/mongoose";
import { CreateBlogInputModelType, createPostForBlogInputModel } from "../type/blogsType";
import { ObjectId } from "mongodb";
import { Post, PostModelType } from "../../posts/domain/posts.schema";
import { UserDocument } from "../../users/domain/entities/users.schema";
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
  async getBannedUsers(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ) {
    const blogs = await this.BlogModel
      .find(filter, { _id: 0,  "banUsersInfo": 1 })
      .select(["banUsersInfo"])
      .lean()
      .sort({ [`banUsersInfo.${sortBy}`]: sortDirection })
      .skip(skip)
      .limit(pageSize)
    if(blogs[0]) {
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
  async createBlog(createDto: CreateBlogInputModelType, user: UserDocument): Promise<Blog> {
    const newBlog = Blog.create(createDto, this.BlogModel, user);
    return newBlog.save();
  }
  async findBlogById(blogId: ObjectId): Promise<BlogDocument> {
    const blog = await this.BlogModel
      .findOne({ _id: blogId });
    return blog;
  }
  async save(blog: BlogDocument) {
    return await blog.save();
  }
  async unBanUser(blogId: Types.ObjectId, login: string, banStatus: boolean): Promise<boolean> {
    const unBanUser = await this.BlogModel
      .updateOne(
        {
          _id: blogId,
          banUsersInfo: {
            $elemMatch: { login: login }
          }
        },
        {
          $set: { "banUsersInfo.$.banInfo.isBanned": banStatus }
        }
      );
    return unBanUser.modifiedCount > 0;
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