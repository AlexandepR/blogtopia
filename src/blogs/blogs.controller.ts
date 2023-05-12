import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { CreateBlogInputModelType, createPostForBlogInputModel, PutBlogDtoType } from "./type/blogsType";
import { ParamsType } from "../types/types";


@Controller("blogs")
export class BlogsController {
  // constructor(private blogsService: UsersService) {}
  constructor(protected blogsService: BlogsService) {

  }
  @Get()
  // getBlogs(@Query("term") term: string) {
  async getBlogs(
    @Query() query: ParamsType
  ) {
    return this.blogsService.findAll(query);
  }
  @Get(":id")
  async getBlog(
    @Param("id")
      id: string
  ) {
    return await this.blogsService.getBlog(id);
  }
  @Get("/:id/posts")
  async GetPostsByBlog(
    @Param("id")
      id: string,
    @Query() query: ParamsType
  ) {
    return await this.blogsService.getPosts(id, query);
  }
  @Post()
  async createBlog(
    @Body() dto: CreateBlogInputModelType
  ) {
    return await this.blogsService.createBlog(dto);
  }
  @Post("/:id/posts")
  async createPostForBlog(
    @Body() dto: createPostForBlogInputModel,
    @Param("id") id: string
  ) {
    return await this.blogsService.createPostForBlog(dto,id);
  }
  @Put(":id")
  async updateBlog(
    @Param("id")
      id: string,
    @Body() dto: PutBlogDtoType
  ) {
    return await this.blogsService.updateBlog(id, dto);
  }
  @Delete(":id")
  async deleteBlog(
    @Param("id")
      id: string) {
    await this.blogsService.deleteBlog(id);
    return `This blog #${id} removes`;
  }
  @Delete()
  async deleteAllBlog() {
    await this.blogsService.deleteAllBlog();
  }

}