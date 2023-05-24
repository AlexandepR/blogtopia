import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req } from "@nestjs/common";
import { BlogInputClassModel, BlogsService, createPostForBlogInputClassModel } from "./blogs.service";
import { ParamsType } from "../types/types";
import { BasicAuth, Public } from "../auth/decorators/public.decorator";
import { Request } from "express";


@Controller("blogs")
export class BlogsController {
  constructor(protected blogsService: BlogsService) {

  }
  // @Public()
  // @UseGuards(BasicAuthGuard)
  // @BasicAuth()
  @Public()
  @Get()
  // @BasicAuth()
  async getBlogs(
    @Query() query: ParamsType
  ) {
    return this.blogsService.findAll(query);
  }
  @Public()
  @Get(":id")
  async getBlog(
    @Param("id")
      id: string
  ) {
    return await this.blogsService.getBlog(id);
  }
  @Public()
  @Get(":id/posts")
  async GetPostsByBlog(
    @Req() req:Request,
    @Param("id")
      id: string,
    @Query() query: ParamsType
  ) {
    return await this.blogsService.getPosts(id, query, req);
  }
  @BasicAuth()
  @Post()
  async createBlog(
    @Body() dto: BlogInputClassModel
  ) {
    return await this.blogsService.createBlog(dto);
  }
  @BasicAuth()
  @Post(":id/posts")
  async createPostForBlog(
    @Param("id")
      id: string,
    @Body() dto: createPostForBlogInputClassModel,
  ) {
    return await this.blogsService.createPostForBlog(dto,id);
  }
  @BasicAuth()
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param("id")
      id: string,
    @Body() dto: BlogInputClassModel,
  ) {
    const purBlog = await this.blogsService.updateBlog(id, dto);
    if(!purBlog) return (HttpStatus.NOT_FOUND)
    return purBlog
  }
  @BasicAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param("id")
      id: string) {
    await this.blogsService.deleteBlog(id);
    return `This blog #${id} removes`;
  }
  @BasicAuth()
  @Delete()
  async deleteAllBlog() {
    await this.blogsService.deleteAllBlog();
  }

}