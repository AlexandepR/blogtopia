import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe
} from "@nestjs/common";
import {
  BlogInputClassModel,
  createPostForBlogInputClassModel,
  updatePostForBlogInputClassModel
} from "../type/blogsType";

import { UserDocument } from "../../users/type/users.schema";
import { CreatePostInputClassModel } from "../../posts/type/postsType";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateBlogCommand } from "../application/use-cases/authUser/updateBlog-blogs-blogger-use-case";
import { DeletePostByBlogCommand } from "../application/use-cases/authUser/deletePostByBlog-blogs-blogger-use-case";
import { CreateBlogCommand } from "../application/use-cases/authUser/create-blog-blogs-blogger-use-case";
import { CreatePostByBlogCommand } from "../application/use-cases/authUser/createPostForBlog-blogs-blogger-use-case";
import { DeleteBlogCommand } from "../application/use-cases/authUser/deleteBlog-blogs-blogger-use-case";
import { UpdatePostByBlogCommand } from "../application/use-cases/authUser/updatePostByBlog-blogs-blogger-use-case";
import { GetBlogsCommand } from "../application/use-cases/authUser/getBlogs-blogs-blogger-use-case";
import { ParamsType } from "../../../types/types";
import { BasicAuth, UserFromRequestDecorator } from "../../../utils/public.decorator";
import { GetBlogByIdCommand } from "../application/use-cases/authUser/getBlogById-blogs-blogger-use-case";
import { checkObjectId } from "../../../utils/validation.helpers";


@Controller({
  path: "blogger/blogs",
})
export class BlogsBloggerController {
  constructor(
    private commandBus: CommandBus,
  ) {
  }
  @Get('')
  async getBlogs(
    @Query() query: ParamsType,
  @UserFromRequestDecorator()user:UserDocument,
  ) {
    const command = new GetBlogsCommand(query, user);
    return this.commandBus.execute(command);
  }
  @Get(":id")
  async getBlog(
    @UserFromRequestDecorator()user:UserDocument,
    @Param("id")
      id: string
  ) {
    const command = new GetBlogByIdCommand(id, user);
    return this.commandBus.execute(command);
  }
  // @Get(":id/posts")
  // async GetPostsByBlog(
  //   @Req() req:Request,
  //   @Param("id")
  //     id: string,
  //   @Query() query: ParamsType
  // ) {
  //   return await this.blogsService.getPosts(id, query, req);
  // }
  @Post('')
  async createBlog(
    @Body() dto: BlogInputClassModel,
    @UserFromRequestDecorator()user:UserDocument,
  ) {
    const command = new CreateBlogCommand(user, dto);
    return await this.commandBus.execute(command);
  }
  @Post(":id/posts")
  async createPostForBlog(
    @Param("id")
      blogId: string,
    @UserFromRequestDecorator()user:UserDocument,
    @Body() dto: createPostForBlogInputClassModel,
  ) {
    const command = new CreatePostByBlogCommand(user, dto, blogId);
    return await this.commandBus.execute(command);
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param(ValidationPipe)
      params: checkObjectId,
    @Body() dto: BlogInputClassModel,
  ) {
    const command = new UpdateBlogCommand(params.id, dto);
    const putBlog = await this.commandBus.execute(command);
    if(!putBlog) return (HttpStatus.NOT_FOUND)
    return putBlog
  }

  @Put(":blogId/posts/:postId")
  async updatePost(
    @Param(ValidationPipe) paramsBlogId: checkObjectId,
    @Param(ValidationPipe) paramsPostId: checkObjectId,
    @Body() body: updatePostForBlogInputClassModel,
  ) {
    const UpdatePostDto: CreatePostInputClassModel = {
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: paramsBlogId.id,
    }
    const command = new UpdatePostByBlogCommand(paramsPostId.id, UpdatePostDto);
    return await this.commandBus.execute(command);
  }
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog (
    @Param(ValidationPipe)
      params: checkObjectId) {
    return await this.commandBus.execute(new DeleteBlogCommand(params.id));
  }
  @Delete(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog (
    @Param(ValidationPipe) paramsBlogId: checkObjectId,
    @Param(ValidationPipe) paramsPostId: checkObjectId,
  ){
    const command = new DeletePostByBlogCommand(paramsBlogId.id, paramsPostId.id);
    await this.commandBus.execute(command);
  }
}