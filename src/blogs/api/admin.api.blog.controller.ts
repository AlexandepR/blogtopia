import {
  Body,
  Controller,
  createParamDecorator,
  Delete, ExecutionContext,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req, Scope, ValidationPipe
} from "@nestjs/common";
import { Request } from "express";
import {
  BlogInputClassModel,
  createPostForBlogInputClassModel,
  updatePostForBlogInputClassModel
} from "../type/blogsType";
import { BasicAuth, Public, UserFromRequestDecorator } from "../../utils/public.decorator";
import { ParamsType } from "../../types/types";
import { UserDocument } from "../../users/type/users.schema";
import { PostsService } from "../../posts/posts.service";
import { PutPostInputModelType } from "../../posts/type/postsType";
import { checkObjectId } from "../../utils/validation.helpers";
import { CommandBus } from "@nestjs/cqrs";
import { getBlogsByAdminCommand } from "../use-cases/admin/getBlogs-blogs-admin-use-case";


@BasicAuth()
@Controller({
  path: "sa",
  // scope: Scope.REQUEST
})
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
  ) {
  }
  @Get('blogs')
  async getBlogs(
    @Query() query: ParamsType,
  ) {
    const command = new getBlogsByAdminCommand(query)
    return this.commandBus.execute(command)
  }

  // @Put("blogs/:blogId/bind-with-user/:userId")
  // async bindUserToBlog(
  //   @Param("blogId") blogId: string,
  //   @Param("userId") userId: string,
  // ) {
  //   // return await this.blogsService.getBlog(id);
  // }

  // @Delete(":id")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteUser(
  //   @Param("id")
  //     id: string,
  //   @Body() dto: BlogInputClassModel,
  // ) {
  //   const purBlog = await this.blogsService.updateBlog(id, dto);
  //   if(!purBlog) return (HttpStatus.NOT_FOUND)
  //   return purBlog
  // }
  //
  // @BasicAuth()
  // @Get(":id")
  // async getUserById(
  //   @Param(ValidationPipe)
  //     params: checkObjectId
  // ) {
  //   return await this.usersService.findUserById(params.id)
  // }
}