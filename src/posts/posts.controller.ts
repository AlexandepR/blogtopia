import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { CreatePostInputModelType, PutPostInputModelType } from "./type/postsType";
import { ParamsType } from "../types/types";
import { PostsService } from "./posts.service";


@Controller("posts")
export class PostsController {
  constructor(protected postsService: PostsService) {
  }
  @Get()
  async getPosts(
    @Query() query: ParamsType
  ) {
    return this.postsService.findAll(query);
  }
  @Get(":id")
  async getPost(
    @Param("id")
      id: string
  ) {
    return await this.postsService.getPost(id);
  }
  @Get("/:id/comments")
  async getCommentByPost(
    @Param("id")
      id: string,
    @Query()
      query: ParamsType
  ) {
    return await this.postsService.getCommentByPost(id,query);
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputModelType) {
    return await this.postsService.createPost(dto);
  }
  // @Post()
  // createPostForBlog(@Body() inputModel: PutBlogInputModelType ) {
  //
  // }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param("id")
      id: string,
    @Body() dto: PutPostInputModelType
  ) {
     await this.postsService.updatePost(id, dto);
     return
  }
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param("id")
      id: string) {
    await this.postsService.deletePost(id);
    return `This blog #${id} removes`;
  }
  @Delete()
  async deleteAllPost() {
    await this.postsService.deleteAllPost();
  }
}