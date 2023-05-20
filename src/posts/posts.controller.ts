import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req } from "@nestjs/common";
import { ParamsType } from "../types/types";
import { CreateCommentInputClassModel, CreatePostInputClassModel, PostsService } from "./posts.service";
import { Request } from 'express';
import { likeStatusType } from "./type/postsType";

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
      postId: string,
    @Query()
      query: ParamsType
  ) {
    return await this.postsService.getCommentByPost(postId,query);
  }
  @Post('/:postId/comments')
  async createCommentForPost(
    @Req() req: Request,
    @Param('postId')
    postId: string,
    @Body() dto:CreateCommentInputClassModel
  ){
    return await this.postsService.createCommentForPost(postId,dto, req)
  }
  @Post()
  async createPost(@Body() dto: CreatePostInputClassModel) {
    return await this.postsService.createPost(dto);
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param("id")
      id: string,
    @Body() dto: CreatePostInputClassModel
  ) {
     await this.postsService.updatePost(id, dto);
     return
  }
  @Put("/:postId/like-status")
  async updateLikesInfoByPostId(
    @Req() req: Request,
    @Param("postId")
      postId: string,
    @Body() dto: likeStatusType
  ) {
      return await this.postsService.updateLikesInfo(dto,postId,req)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param("id")
      id: string) {
    return await this.postsService.deletePost(id);
    // return `This blog #${id} removes`;
  }
  @Delete()
  async deleteAllPost() {
    await this.postsService.deleteAllPost();
  }
}