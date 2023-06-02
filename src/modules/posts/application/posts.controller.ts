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
import { ParamsType } from "../../../types/types";
import { CreateCommentInputClassModel, PostsService } from "./posts.service";
import { Request } from 'express';
import { CreatePostInputClassModel, likeStatusInputClassModel } from "../type/postsType";
import { BasicAuth, Public, UserFromRequestDecorator } from "../../../utils/public.decorator";
import { checkObjectId } from "../../../utils/validation.helpers";
import { UserDocument } from "../../users/type/users.schema";
import { CommandBus } from "@nestjs/cqrs";
import { UpdatePostLikeStatusCommand } from "./use-cases/updatePostLikeStatus-use-case";
import { GetCommentsByPostCommand } from "./use-cases/getCommentsByPost-use-case";
import { CreateCommentForPostCommand } from "./use-cases/createCommentForPost-use-case";
import { GetPostsCommand } from "./use-cases/getPosts-use-case";
import { GetPostByIdCommand } from "./use-cases/getPostById-use-case";
import { CreatePostCommand } from "./use-cases/createPost-use-case";
import { UpdatePostCommand } from "./use-cases/updatePost-use-case";
import { DeletePostByIdCommand } from "./use-cases/deletePostById-use-case";
import { DeleteAllPostsCommand } from "./use-cases/deleteAllPost-use-case";

@Controller("posts")
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected commandBus: CommandBus,
  ) {
  }
  @Public()
  @Get()
  async getPosts(
    @UserFromRequestDecorator() user: UserDocument,
    @Query() query: ParamsType
  ) {
    const command = new GetPostsCommand(query,user)
    return await this.commandBus.execute(command)
    // return this.postsService.findAll(query, req);
  }
  @Public()
  @Get(":id")
  async getPost(
    // @Req() req: Request,
    @UserFromRequestDecorator() user: UserDocument,
    @Param(ValidationPipe)
      param: checkObjectId
  ) {
    const command = new GetPostByIdCommand(param.id,user)
    return await this.commandBus.execute(command)
    // return await this.postsService.getPost(id,req);
  }
  @Public()
  @Get("/:id/comments")
  async getCommentByPost(
    @Param(ValidationPipe)
      param: checkObjectId,
    @Query()
      query: ParamsType
  ) {
    const command = new GetCommentsByPostCommand(query, param.id)
    return await this.commandBus.execute(command)
    // return await this.postsService.getCommentsByPost(id,query);
  }
  @Post('/:postId/comments')
  async createCommentForPost(
    @Req() req: Request,
    @UserFromRequestDecorator() user: UserDocument,
    @Param(ValidationPipe)
      param: checkObjectId,
    @Body() dto:CreateCommentInputClassModel
  ){
    const command = new CreateCommentForPostCommand(param.id,dto,user)
    return await this.commandBus.execute(command)
    // return await this.postsService.createCommentForPost(postId,dto, user)
  }
  @Post()
  async createPost(
    @UserFromRequestDecorator()user:UserDocument,
    @Body() dto: CreatePostInputClassModel
  ) {
    const command = new CreatePostCommand(dto,user)
    return await this.commandBus.execute(command)
    // return await this.postsService.createPost(dto,user);
  }
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param(ValidationPipe)
      param: checkObjectId,
    @Body() dto: CreatePostInputClassModel
  ) {
    const command = new UpdatePostCommand(dto,param.id)
    return await this.commandBus.execute(command)
     // await this.postsService.updatePost(id, dto);
     // return
  }
  @Put("/:id/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikesInfoByPostId(
    // @Req() req: Request,
    @UserFromRequestDecorator()user:UserDocument,
    @Param(ValidationPipe)
      params: checkObjectId,
    @Body() dto: likeStatusInputClassModel
  ) {
    const command = new UpdatePostLikeStatusCommand(dto, params.id, user)
      return await this.commandBus.execute(command)
      // return await this.postsService.updateLikesInfo(dto,params.id,req)
  }
  @BasicAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param(ValidationPipe)
      param: checkObjectId,
  )
  {
    const command = new DeletePostByIdCommand(param.id)
    return await this.commandBus.execute(command)
    // return await this.postsService.deletePost(id);
    // return `This blog #${id} removes`;
  }
  @BasicAuth()
  @Delete()
  async deleteAllPost() {
    const command = new DeleteAllPostsCommand()
    return await this.commandBus.execute(command)
    // await this.postsService.deleteAllPost();
  }
}