import { Body, Controller, Delete, Get, Param, Put, Req } from "@nestjs/common";
import { Request } from "express";
import { likeStatusInputClassModel } from "../../posts/type/postsType";
import { BasicAuth, Public, UserFromRequestDecorator } from "../../../utils/public.decorator";
import { UserDocument } from "../../users/domain/entities/users.schema";
import { commentContentInputClassModel } from "../type/commentsType";
import { Types } from "mongoose";
import { CommandBus } from "@nestjs/cqrs";
import { UpdateCommentLikeStatusCommand } from "./use-cases/update-сomment-like-status.use-case";
import { DeleteCommentCommand } from "./use-cases/delete-comment.use-case";
import { UpdateCommentCommand } from "./use-cases/update-comment.use-case";
import { GetCommentCommand } from "./use-cases/get-comments.use-case";

@Controller("comments")
export class CommentsController {
  constructor(
    // protected commentsService: CommentsService,
  private commandBus: CommandBus,
  ) {

  }
  @Public()
  @Get(":id")
  async getComment(
    @UserFromRequestDecorator() user: UserDocument,
    @Param("id")
      id: string
  ) {
    const command = new GetCommentCommand(user,id);
    return await this.commandBus.execute(command);
    // return await this.commentsService.getComment( new Types.ObjectId(id), req);
  }
  @Put(":id")
  async updateComment(
    @Param("id")
      id: string,
    @UserFromRequestDecorator() user: UserDocument,
    @Body() dto: commentContentInputClassModel
  ) {
    const command = new UpdateCommentCommand(dto, id, user);
    return await this.commandBus.execute(command);
  }
  @Put(':id/like-status')
  async updateLikeByCommentId(
    @Body() dto: likeStatusInputClassModel,
    @UserFromRequestDecorator() user: UserDocument,
    @Param('id') id: string,
  ) {
    const command = new UpdateCommentLikeStatusCommand(dto, id, user);
    return await this.commandBus.execute(command);
  }
  @Delete(":id")
  async deleteCommentById(
    @Param("id") id: string,
    // @Req() req:Request,
    @UserFromRequestDecorator() user: UserDocument,
  )
  {
    const command = new DeleteCommentCommand(user, id);
    return await this.commandBus.execute(command);
    return `This blog #${id} removes`;
  }
  // @BasicAuth()
  // @Delete('all')
  // async deleteAllComment() {
  //  return await this.commentsService.deleteAllComment();
  // }
}