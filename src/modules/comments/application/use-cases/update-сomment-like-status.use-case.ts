import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../../utils/validation.helpers';
import { validateIdByUUID } from '../../../../utils/helpers';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { likeStatusInputClassModel } from '../../../posts/type/postsType';
import { UserType } from '../../../users/type/usersTypes';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql-repository';


export class UpdateCommentLikeStatusCommand {
  constructor(
    public dto: likeStatusInputClassModel,
    public commentId: string,
    public user: UserType
  ) {
  }
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase implements ICommandHandler<UpdateCommentLikeStatusCommand> {
  constructor(
    protected commentsSqlRepository: CommentsSqlRepository,
  ) {}
  async execute({dto, commentId, user}: UpdateCommentLikeStatusCommand): Promise<boolean> {
    await validateOrRejectModel(dto, likeStatusInputClassModel);
    if (!validateIdByUUID(commentId)) throw new NotFoundException()
    const comment = await this.commentsSqlRepository.getCommentById(commentId);
    if (!user || !comment || user.banInfo.isBanned) throw new NotFoundException()
    if (dto.likeStatus === 'None') return await this.commentsSqlRepository.deleteLikesStatus(user.ID, commentId);
    const updateLikesStatus = await this.commentsSqlRepository.createCommentLikesData(user.ID, user.login, commentId, dto);
    if (updateLikesStatus) return true
    throw new HttpException('', HttpStatus.NOT_FOUND);
  }
}