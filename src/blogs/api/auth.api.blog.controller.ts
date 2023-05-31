import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import {
  BlogInputClassModel,
  createPostForBlogInputClassModel,
  updatePostForBlogInputClassModel
} from "../type/blogsType";
import { UserFromRequestDecorator } from "../../utils/public.decorator";
import { ParamsType } from "../../types/types";
import { UserDocument } from "../../users/type/users.schema";
import { CreatePostInputClassModel } from "../../posts/type/postsType";
import { CommandBus } from "@nestjs/cqrs";
import { updatePostByBlogCommand } from "../use-cases/authUser/updatePostByBlog-blogs-blogger-use-case";
import { updateBlogCommand } from "../use-cases/authUser/updateBlog-blogs-blogger-use-case";
import { deletePostByBlogCommand } from "../use-cases/authUser/deletePostByBlog-blogs-blogger-use-case";
import { createBlogCommand } from "../use-cases/authUser/create-blog-blogs-blogger-use-case";
import { createPostByBlogCommand } from "../use-cases/authUser/createPostForBlog-blogs-blogger-use-case";
import { getBlogsCommand } from "../use-cases/authUser/getBlogs-blogs-blogger-use-case";
import { deleteBlogCommand } from "../use-cases/authUser/deleteBlog-blogs-blogger-use-case";


@Controller({
  path: "blogger",
})
export class BlogsBloggerController {
  constructor(
    private commandBus: CommandBus,
  ) {
  }
  @Get('/blogs')
  async getBlogs(
    @Query() query: ParamsType,
  @UserFromRequestDecorator()user:UserDocument,
  ) {
    const command = new getBlogsCommand(query, user);
    return this.commandBus.execute(command);
  }
  // @Get(":id")
  // async getBlog(
  //   @Param("id")
  //     id: string
  // ) {
  //   return await this.blogsService.getBlog(id);
  // }
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
    const command = new createBlogCommand(user, dto);
    return await this.commandBus.execute(command);
  }
  @Post(":id/posts")
  async createPostForBlog(
    @Param("id")
      blogId: string,
    @UserFromRequestDecorator()user:UserDocument,
    @Body() dto: createPostForBlogInputClassModel,
  ) {
    const command = new createPostByBlogCommand(user, dto, blogId);
    return await this.commandBus.execute(command);
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param("id")
      id: string,
    @Body() dto: BlogInputClassModel,
  ) {
    const command = new updateBlogCommand(id, dto);
    const putBlog = await this.commandBus.execute(command);
    if(!putBlog) return (HttpStatus.NOT_FOUND)
    return putBlog
  }

  @Put(":blogId/posts/:postId")
  async updatePost(
    @Param("blogId") blogId: string,
    @Param("postId") postId: string,
    @Body() body: updatePostForBlogInputClassModel,
  ) {
    const UpdatePostDto: CreatePostInputClassModel = {
      title: body.title,
      shortDescription: body.shortDescription,
      content: body.content,
      blogId: blogId,
    }
    const command = new updatePostByBlogCommand(postId, UpdatePostDto);
    return await this.commandBus.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog (
    @Param("id")
      id: string) {
    await this.commandBus.execute(new deleteBlogCommand(id));
    return `This blog #${id} removes`;
  }

  @Delete(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlog (
    @Param("blogId") blogId: string,
    @Param("postId") postId: string,
  ){
    const command = new deletePostByBlogCommand(blogId, postId);
    await this.commandBus.execute(command);
    return `This posts #${postId} removes`;
  }
}