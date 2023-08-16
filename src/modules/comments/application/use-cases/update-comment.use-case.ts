import { commentContentInputClassModel } from "../../type/commentsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructure/comments.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { validateIdByUUID, validateObjectId } from '../../../../utils/helpers';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Types } from "mongoose";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { UserType } from '../../../users/type/usersTypes';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';


export class UpdateCommentCommand {
  constructor(
    public dto: commentContentInputClassModel,
    public commentId: string,
    public user: UserType
  ) {
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    protected commentsSqlRepository: CommentsSqlRepository,
  ) {
  }
  async execute({dto, commentId, user}: UpdateCommentCommand): Promise<void> {
    await validateOrRejectModel(dto, commentContentInputClassModel);
    if(!validateIdByUUID(commentId)) throw new NotFoundException()
    const comment = await this.commentsSqlRepository.getCommentById(commentId);
    if (!comment) throw new HttpException("", HttpStatus.NOT_FOUND);
    const commentIsUpdate = await this.commentsSqlRepository.updateCommentId(commentId, dto.content);
    if (user.ID !== comment?.commentatorInfo.userId) throw new HttpException("", HttpStatus.FORBIDDEN);
    if (commentIsUpdate) throw new HttpException("", HttpStatus.NO_CONTENT);
    throw new HttpException("", HttpStatus.NOT_FOUND);
  }
}