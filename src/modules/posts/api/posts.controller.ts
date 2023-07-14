import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req
} from "@nestjs/common";
import { ParamsType } from "../../../types/types";
import { CreateCommentInputClassModel, PostsService } from "../application/posts.service";
import { Request } from "express";
import { CreatePostInputClassModel, likeStatusInputClassModel } from "../type/postsType";
import { BasicAuth, Public, UserFromRequestDecorator } from "../../../utils/public.decorator";
import { UserDocument } from "../../users/domain/entities/users.schema";
import { CommandBus } from "@nestjs/cqrs";
import { UpdatePostLikeStatusCommand } from "../application/use-cases/update-post-like-status.use-case";
import { GetCommentsByPostCommand } from "../application/use-cases/get-comments-by-post.use-case";
import { CreateCommentForPostCommand } from "../application/use-cases/create-comment-for-post.use-case";
import { GetPostsCommand } from "../application/use-cases/get-posts.use-case";
import { GetPostByIdCommand } from "../application/use-cases/get-post-by-id.use-case";
import { CreatePostCommand } from "../application/use-cases/create-post.use-case";
import { UpdatePostCommand } from "../application/use-cases/update-post.use-case";
import { DeletePostByIdCommand } from "../application/use-cases/delete-post-by-id.use-case";
import { DeleteAllPostsCommand } from "../application/use-cases/delete-all-post.use-case";
import { FindUserType } from '../../users/type/usersTypes';

@Controller("posts")
export class PostsController {
  constructor(
    protected commandBus: CommandBus,
  ) {
  }
  @Public()
  @Get()
  async getPosts(
    @UserFromRequestDecorator() user: FindUserType,
    @Query() query: ParamsType
  ) {
    const command = new GetPostsCommand(query,user)
    return await this.commandBus.execute(command)
  }
  @Public()
  @Get(":id")
  async getPost(
    @UserFromRequestDecorator() user: FindUserType,
    @Param('id')
      id: string
  ) {
    if(!id) throw new NotFoundException()
    const command = new GetPostByIdCommand(id,user)
    return await this.commandBus.execute(command)
  }
  @Public()
  @Get("/:id/comments")
  async getCommentByPost(
    @UserFromRequestDecorator() user: FindUserType,
    @Param('id')
      id: string,
    @Query()
      query: ParamsType
  ) {
    if(!id) throw new NotFoundException()
    const command = new GetCommentsByPostCommand(query,id, user)
    return await this.commandBus.execute(command)
  }
  @Post('/:postId/comments')
  async createCommentForPost(
    @Req() req: Request,
    @UserFromRequestDecorator() user: FindUserType,
    @Param('postId')
      id: string,
    @Body() dto:CreateCommentInputClassModel
  ){
    if(!id) throw new NotFoundException()
    const command = new CreateCommentForPostCommand(id, user, dto)
    return await this.commandBus.execute(command)
  }
  @Post()
  async createPost(
    @UserFromRequestDecorator()user:UserDocument,
    @Body() dto: CreatePostInputClassModel
  ) {
    const command = new CreatePostCommand(dto,user)
    return await this.commandBus.execute(command)
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param("id")
      id: string,
    @Body() dto: CreatePostInputClassModel
  ) {
    if(!id) throw new NotFoundException()
    const command = new UpdatePostCommand(dto,id)
    return await this.commandBus.execute(command)
  }
  @Put("/:id/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesInfoByPostId(
    @UserFromRequestDecorator()user:FindUserType,
    @Param("id")
      id: string,
    @Body() dto: likeStatusInputClassModel
  ) {
    if(!id) throw new NotFoundException()
    const command = new UpdatePostLikeStatusCommand(dto, id, user)
      return await this.commandBus.execute(command)
  }
  @BasicAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id')
      id: string,
  )
  {
    if(!id) throw new NotFoundException()
    const command = new DeletePostByIdCommand(id)
    return await this.commandBus.execute(command)
  }
  @BasicAuth()
  @Delete()
  async deleteAllPost() {
    const command = new DeleteAllPostsCommand()
    return await this.commandBus.execute(command)
  }
}