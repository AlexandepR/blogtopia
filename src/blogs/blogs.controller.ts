import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { BlogInputClassModel, BlogsService, createPostForBlogInputClassModel } from "./blogs.service";
import { ParamsType } from "../types/types";
import { Public } from "../auth/decorators/public.decorator";



@Controller("blogs")
export class BlogsController {
  constructor(protected blogsService: BlogsService) {

  }
  // @Public()
  // @UseGuards(BasicAuthGuard)
  // @BasicAuth()
  // @Public()
  @Get()
  // @BasicAuth()
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
  @Get(":id/posts")
  async GetPostsByBlog(
    @Param("id")
      id: string,
    @Query() query: ParamsType
  ) {
    return await this.blogsService.getPosts(id, query);
  }
  @Public()
  @Post()
  async createBlog(
    @Body() dto: BlogInputClassModel
  ) {
    return await this.blogsService.createBlog(dto);
  }
  @Post(":id/posts")
  async createPostForBlog(
    @Body() dto: createPostForBlogInputClassModel,
    @Param("id") id: string
  ) {
    return await this.blogsService.createPostForBlog(dto,id);
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param("id")
      id: string,
    @Body() dto: BlogInputClassModel
  ) {
    const purBlog = await this.blogsService.updateBlog(id, dto);
    if(!purBlog) return (HttpStatus.NOT_FOUND)
    return purBlog
  }
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
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