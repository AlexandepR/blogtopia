import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus, NotFoundException,
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
    if(!id) throw new NotFoundException()
    const command = new GetBlogByIdCommand(id, user);
    return this.commandBus.execute(command);
  }
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
    if(!blogId) throw new NotFoundException()
    const command = new CreatePostByBlogCommand(user, dto, blogId);
    return await this.commandBus.execute(command);
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @UserFromRequestDecorator()user:UserDocument,
    @Param("id")
      id: string,
    @Body() dto: BlogInputClassModel,
  ) {
    if(!id) throw new NotFoundException()
    const command = new UpdateBlogCommand(id, dto, user);
    const putBlog = await this.commandBus.execute(command);
    if(!putBlog) return (HttpStatus.NOT_FOUND)
    return putBlog
  }

  @Put(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @UserFromRequestDecorator()user:UserDocument,
    @Param("blogId") blogId: string,
    @Param("postId") postId: string,
    @Body() dto: CreatePostInputClassModel,
  ) {
    if(!blogId || !postId) throw new NotFoundException()
    // const UpdatePostDto: CreatePostInputClassModel = {
    //   title: body.title,
    //   shortDescription: body.shortDescription,
    //   content: body.content,
    //   blogId: blogId,
    // }
    const command = new UpdatePostByBlogCommand(postId, dto, user);
    return await this.commandBus.execute(command);
  }
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog (
    @UserFromRequestDecorator()user:UserDocument,
    @Param('id')
      id: string) {
    if(!id) throw new NotFoundException()
    return await this.commandBus.execute(new DeleteBlogCommand(id,user));
  }
  @Delete(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog (
    @UserFromRequestDecorator()user:UserDocument,
    @Param("blogId") blogId: string,
    @Param("postId") postId: string,
  ){
    if(!blogId || !postId) throw new NotFoundException()
    const command = new DeletePostByBlogCommand(blogId, postId,user);
    await this.commandBus.execute(command);
  }
}