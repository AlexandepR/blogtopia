import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { BlogInputClassModel, PostForBlogBloggerInputClassModel } from "../type/blogsType";
import { UserDocument } from "../../users/domain/entities/users.schema";
import { CreatePostForBlogInputClassModel } from "../../posts/type/postsType";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateBlogCommand } from "../application/use-cases/authUser/updateBlog-blogger-use-case";
import { DeletePostByBlogCommand } from "../application/use-cases/authUser/deletePostByBlog-blogger-use-case";
import { CreateBlogCommand } from "../application/use-cases/authUser/create-blog-blogger-use-case";
import { CreatePostByBlogCommand } from "../application/use-cases/authUser/createPostForBlog-blogger-use-case";
import { DeleteBlogCommand } from "../application/use-cases/authUser/deleteBlog-blogger-use-case";
import { UpdatePostByBlogCommand } from "../application/use-cases/authUser/updatePostByBlog-blogger-use-case";
import { GetBlogsCommand } from "../application/use-cases/authUser/getBlogs-blogger-use-case";
import { ParamsPaginationType, ParamsType } from "../../../types/types";
import { UserFromRequestDecorator } from "../../../utils/public.decorator";
import { GetBlogByIdCommand } from "../application/use-cases/authUser/getBlogById-blogger-use-case";
import {
  GetAllCommentsForBloggerCommand
} from "../application/use-cases/authUser/getAllCommentsForAllPosts-blogger-use-case";


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
  @Get('comments')
  async getAllComments(
    @Query() query: ParamsPaginationType,
    @UserFromRequestDecorator()user:UserDocument,
  ){
    const command = new GetAllCommentsForBloggerCommand(query, user)
    return this.commandBus.execute(command)
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
  @Post('')
  async createBlog(
    @Body() dto: BlogInputClassModel,
    @UserFromRequestDecorator()user:UserDocument,
  ) {
    const command = new CreateBlogCommand(user, dto);
    return await this.commandBus.execute(command)
  }
  @Post(":blogId/posts")
  async createPostForBlog(
    @Param("blogId")
      blogId: string,
    @UserFromRequestDecorator()user:UserDocument,
    @Body() dto: PostForBlogBloggerInputClassModel,
  ) {
    const command = new CreatePostByBlogCommand(user, dto, blogId);
    return await this.commandBus.execute(command)
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @UserFromRequestDecorator()user:UserDocument,
    @Param("id")
      id: string,
    @Body() dto: BlogInputClassModel,
  ) {
    const command = new UpdateBlogCommand(id, dto, user);
    return await this.commandBus.execute(command)
  }
  @Put(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @UserFromRequestDecorator()user:UserDocument,
    @Param("blogId") blogId: string,
    @Param("postId") postId: string,
    @Body() dto: CreatePostForBlogInputClassModel,
  ) {
    const command = new UpdatePostByBlogCommand(blogId, postId, dto, user);
    return await this.commandBus.execute(command);
  }
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog (
    @UserFromRequestDecorator()user:UserDocument,
    @Param('id')
      id: string) {
    return await this.commandBus.execute(new DeleteBlogCommand(id, user));
  }
  @Delete(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog (
    @UserFromRequestDecorator()user:UserDocument,
    @Param("blogId") blogId: string,
    @Param("postId") postId: string,
  ){
    const command = new DeletePostByBlogCommand(blogId, postId,user);
    await this.commandBus.execute(command);
  }
}
