import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BlogType } from "./blogs.module";


@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: any,
  ) {}

  async findAll(): Promise<BlogType[]>{
    return await this.blogModel.find().exec();
  }
  async createOne(createProductDto: CreateBlogDto): Promise<any> {
    const blog = new this.blogModel(createProductDto);
    return blog.save()
  }
}