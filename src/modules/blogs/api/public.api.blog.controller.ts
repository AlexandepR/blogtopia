import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';

import { CommandBus } from '@nestjs/cqrs';
import { GetBlogCommand } from '../application/use-cases/public/getBlog-blog-public-use-case';
import { GetBlogsCommand } from '../application/use-cases/public/get-blogs-public-use-case';
import { GetPostsByBlogCommand } from '../application/use-cases/public/getPostsByblogs-public-use-case';
import { Public, UserFromRequestDecorator } from '../../../utils/public.decorator';
import { ParamsType } from '../../../types/types';
import { UserType } from '../../users/type/usersTypes';


@Controller("blogs")
export class BlogsPublicController {
  constructor(
    private commandBus: CommandBus,
  ) {
  }
  @Public()
  @Get()
  async getBlogs(
    @Query() query: ParamsType,
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
    const command = new GetBlogCommand(id)
    return this.commandBus.execute(command);
  }
  @Public()
  @Get(":id/posts")
  async GetPostsByBlog(
    @UserFromRequestDecorator() user: UserType,
    @Param("id")
      id: string,
    @Query() query: ParamsType
  ) {
    const command = new GetPostsByBlogCommand(id, query, user)
    return await this.commandBus.execute(command);
  }
}