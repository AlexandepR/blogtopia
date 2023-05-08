import { Injectable } from "@nestjs/common";
import { Blog, BlogDocument, BlogModelStaticType } from "./type/blogs.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SuperBlogStaticType } from "../../dist/comments/type/blogs.schema";

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument> & BlogModelStaticType) {
  }
  async findBlogs(term: string): Promise<BlogDocument[]> {
    return this.BlogModel.find().exec();
  }
  async create(createDto: any): Promise<Blog> {
    const superBlog = this.BlogModel.createSuperBlog(createDto, this.BlogModel)
    const createdBlog = new this.BlogModel(createDto);
    return createdBlog.save();
  }
  async save(blog:BlogDocument) {
    await blog.save();
  }

}