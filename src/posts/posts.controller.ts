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
  Req,
  ValidationPipe
} from "@nestjs/common";
import { ParamsType } from "../types/types";
import { CreateCommentInputClassModel, CreatePostInputClassModel, PostsService } from "./posts.service";
import { Request } from 'express';
import { likeStatusClass, likeStatusType } from "./type/postsType";
import { BasicAuth, Public } from "../auth/decorators/public.decorator";
import { checkObjectId } from "../helpers/validation.helpers";

@Controller("posts")
export class PostsController {
  constructor(protected postsService: PostsService) {
  }
  @Public()
  @Get()
  async getPosts(
    @Query() query: ParamsType
  ) {
    return this.postsService.findAll(query);
  }
  @Public()
  @Get(":id")
  async getPost(
    @Req() req: Request,
    @Param("id")
      id: string
  ) {
    return await this.postsService.getPost(id,req);
  }
  @Public()
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
  @BasicAuth()
  @Post()
  async createPost(@Body() dto: CreatePostInputClassModel) {
    return await this.postsService.createPost(dto);
  }
  @BasicAuth()
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
  @Put("/:id/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesInfoByPostId(
    @Req() req: Request,
    @Param(ValidationPipe)
      params: checkObjectId,
    @Body() dto: likeStatusClass
  ) {
      return await this.postsService.updateLikesInfo(dto,params.id,req)
  }
  @BasicAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param("id")
      id: string) {
    return await this.postsService.deletePost(id);
    // return `This blog #${id} removes`;
  }
  @BasicAuth()
  @Delete()
  async deleteAllPost() {
    await this.postsService.deleteAllPost();
  }
}