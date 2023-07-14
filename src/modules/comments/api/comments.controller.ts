import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put } from '@nestjs/common';
import { likeStatusInputClassModel } from '../../posts/type/postsType';
import { Public, UserFromRequestDecorator } from '../../../utils/public.decorator';
import { commentContentInputClassModel } from '../type/commentsType';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-сomment-like-status.use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { GetCommentCommand } from '../application/use-cases/get-comments.use-case';
import { FindUserType } from '../../users/type/usersTypes';

@Controller("comments")
export class CommentsController {
  constructor(
  private commandBus: CommandBus,
  ) {

  }
  @Public()
  @Get(":id")
  async getComment(
    @UserFromRequestDecorator() user: FindUserType,
    @Param("id")
      id: string
  ) {
    const command = new GetCommentCommand(user,id);
    return await this.commandBus.execute(command);
  }
  @Put(":id")
  async updateComment(
    @Param("id")
      id: string,
    @UserFromRequestDecorator() user: FindUserType,
    @Body() dto: commentContentInputClassModel
  ) {
    const command = new UpdateCommentCommand(dto, id, user);
    return await this.commandBus.execute(command);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async updateLikeByCommentId(
    @Body() dto: likeStatusInputClassModel,
    @UserFromRequestDecorator() user: FindUserType,
    @Param('id') id: string,
  ) {
    const command = new UpdateCommentLikeStatusCommand(dto, id, user);
    return await this.commandBus.execute(command);
  }
  @Delete(":id")
  async deleteCommentById(
    @Param("id") id: string,
    // @Req() req:Request,
    @UserFromRequestDecorator() user: FindUserType,
  )
  {
    const command = new DeleteCommentCommand(user, id);
    return await this.commandBus.execute(command);
  }
}