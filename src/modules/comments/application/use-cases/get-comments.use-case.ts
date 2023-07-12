import { CommentDataType } from '../../type/commentsType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateIdByUUID } from '../../../../utils/helpers';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { FindUserType } from '../../../users/type/usersTypes';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';

export class GetCommentCommand {
  constructor(
    public user: FindUserType,
    public commentId: string,
  ) {
  }
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
      protected commentsSqlRepository: CommentsSqlRepository
  ) {
  }
  async execute({ user, commentId }: GetCommentCommand): Promise<CommentDataType> {
    if(!validateIdByUUID(commentId)) throw new NotFoundException()
    const comment = await this.commentsSqlRepository.getCommentById(commentId, user?.ID);
    if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
    return comment
  }
}