import { LikesType } from "../../type/commentsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../comments.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { updateCommentLikesInfo, validateObjectId } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { likeStatusInputClassModel } from "../../../posts/type/postsType";


export class UpdateCommentLikeStatusCommand {
  constructor(
    public dto: likeStatusInputClassModel,
    public id: string,
    public user: UserDocument
  ) {
  }
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateOmmentLikeStatusUseCase implements ICommandHandler<UpdateCommentLikeStatusCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
  ) {}
  async execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
    await validateOrRejectModel(command.dto, likeStatusInputClassModel);
    const likeStatus = command.dto.likeStatus
    const commentId = validateObjectId(command.id);
    const userId = command.user._id
    if (!userId) throw new HttpException('', HttpStatus.UNAUTHORIZED)
    const comment = await this.commentsRepository.getCommentsById(commentId);
    if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
    const newLikesData: LikesType = {
      _id: new Types.ObjectId(),
      createdAt: new Date().toISOString(),
      userId: userId,
      userLogin: command.user.accountData.login,
    };
    if (likeStatus === 'Like') {
      const checkDislikes = await this.commentsRepository.checkLikes(commentId, userId, 'dislikesData');
      if (checkDislikes) {
        const comment = await this.commentsRepository.getCommentsById(commentId);
        const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
        const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
        throw new HttpException('', HttpStatus.NO_CONTENT)
      }
      await this.commentsRepository.checkLikes(commentId, userId, 'likesData');
      const comment = await this.commentsRepository.getCommentsById(commentId);
      const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
      const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
      throw new HttpException('', HttpStatus.NO_CONTENT)
    }
    if (likeStatus === 'Dislike') {
      const checkLikes = await this.commentsRepository.checkLikes(commentId, userId, 'likesData');
      if (checkLikes) {
        const comment = await this.commentsRepository.getCommentsById(commentId);
        const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
        const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
        throw new HttpException('', HttpStatus.NO_CONTENT);
      }
      await this.commentsRepository.checkLikes(commentId, userId, 'dislikesData');
      const comment = await this.commentsRepository.getCommentsById(commentId);
      const updateCommentLikesCount = updateCommentLikesInfo(comment!, likeStatus, newLikesData);
      const updateLike = await this.commentsRepository.updateCommentLikesInfo(updateCommentLikesCount!, commentId);
      throw new HttpException('', HttpStatus.NO_CONTENT)

    }
    if (likeStatus === 'None') {
      await this.commentsRepository.checkLikes(commentId, userId, 'dislikesData');
      await this.commentsRepository.checkLikes(commentId, userId, 'likesData');
      const comment = await this.commentsRepository.getCommentsById(commentId);
      comment!.likesInfo.dislikesCount = comment!.likesInfo.dislikesData.length;
      comment!.likesInfo.likesCount = comment!.likesInfo.likesData.length;
      const updateLike = await this.commentsRepository.updateLikeComment(comment!, commentId);
      if (updateLike) throw new HttpException('', HttpStatus.NO_CONTENT)
    }
    throw new HttpException('', HttpStatus.BAD_REQUEST)
  }
}