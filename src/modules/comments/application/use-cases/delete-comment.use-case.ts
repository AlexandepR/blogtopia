import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateIdByUUID } from '../../../../utils/helpers';
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';
import { FindUserType } from '../../../users/type/usersTypes';


export class DeleteCommentCommand {
  constructor(
    public user: FindUserType,
    public commentId: string,
  ) {
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    protected commentsSqlRepository: CommentsSqlRepository,
  ) {}
  async execute({ user, commentId }: DeleteCommentCommand): Promise<void> {
    if(!validateIdByUUID(commentId)) throw new NotFoundException()
    const getComment = await this.commentsSqlRepository.getCommentById(commentId);
    if (!getComment) {throw new HttpException('', HttpStatus.NOT_FOUND)}
    if (user.ID !== getComment?.commentatorInfo.userId) throw new ForbiddenException()
    const isDeleted = await this.commentsSqlRepository.deleteComment(commentId);
    if (isDeleted) {throw new HttpException('', HttpStatus.NO_CONTENT)} else {
      throw new HttpException('', HttpStatus.NOT_FOUND)}}
}