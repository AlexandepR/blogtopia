import { commentContentInputClassModel, CommentReturnType, CommentType } from "../../type/commentsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../comments.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { idParamsValidator } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";


export class GetCommentCommand {
  constructor(
    public user: UserDocument,
    public id: string,
  ) {
  }
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
  ) {
  }
  async execute(command: GetCommentCommand): Promise<CommentReturnType> {
    const userId = command.user._id
    const commentId = new Types.ObjectId(command.id)
    const comment = await this.commentsRepository.getCommentsById(commentId);
    if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
    if (comment) {
      const getMyStatusLikeInfo = await this.commentsRepository.getMyStatusLikeInfo(commentId, userId);
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId.toString(),
          userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likesCount,
          dislikesCount: comment.likesInfo.dislikesCount,
          myStatus: getMyStatusLikeInfo,
        }
      };
    }
    return null;
  }
}