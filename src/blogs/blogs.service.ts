import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BlogsRepository } from "./blogs.repository";
import { CreateBlogInputModelType } from "./type/blogsType";


@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}

  findAll(term:string) {
    return this.blogsRepository.findBlogs(term)
  }
  create(inputModel: CreateBlogInputModelType) {

  }
}