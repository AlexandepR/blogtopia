import { Controller, Delete, Get, Param, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { BasicAuth, Public } from "../../utils/public.decorator";
import { ParamsType, ParamsTypeClassModel } from "../../types/types";
import { CommandBus } from "@nestjs/cqrs";
import { GetBlogCommand } from "../use-cases/public/getBlog-blog-public-use-case";
import { GetBlogsCommand } from "../use-cases/public/get-blogs-public-use-case";
import { GetPostsByBlogCommand } from "../use-cases/public/getPosts-blogs-public-use-case";


@Controller("blogs")
export class BlogsPublicController {
  constructor(
    private commandBus: CommandBus,
  ) {
  }
  @Public()
  @Get()
  async getBlogs(
    @Query() query: ParamsTypeClassModel,
  ) {
    const command = new GetBlogsCommand(query)
    return await this.commandBus.execute(command);
  }
  @Public()
  @Get(":id")
  async getBlog(
    @Param("id")
      id: string
  ) {
    return this.commandBus.execute(new GetBlogCommand(id));
  }
  @Public()
  @Get(":id/posts")
  async GetPostsByBlog(
    @Req() req:Request,
    @Param("id")
      id: string,
    @Query() query: ParamsType
  ) {
    const command = new GetPostsByBlogCommand(id, query)
    return await this.commandBus.execute(command);
  }
}