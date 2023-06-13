import { CommentReturnType } from "../../type/commentsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../comments.repository";
import { filterBanCommentLikesInfo } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import { UsersRepository } from "../../../users/application/users.repository";


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
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: GetCommentCommand): Promise<CommentReturnType> {
    // if(command.user) {}
    const userId = command.user ? command.user._id : null
    const commentId = new Types.ObjectId(command.id)
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const filter = (
        { "commentatorInfo.userLogin": { $nin: banUsers }
    });
    const comment = await this.commentsRepository.getCommentsById(commentId,filter,banUsers);
    if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND)
    const filterBanUserLikes = filterBanCommentLikesInfo(comment,banUsers)
    if (filterBanUserLikes) {
      const getMyStatusLikeInfo = await this.commentsRepository.getMyStatusLikeInfo(commentId, userId);
      return {
        id: filterBanUserLikes._id.toString(),
        content: filterBanUserLikes.content,
        commentatorInfo: {
          userId: filterBanUserLikes.commentatorInfo.userId.toString(),
          userLogin: filterBanUserLikes.commentatorInfo.userLogin
        },
        createdAt: filterBanUserLikes.createdAt,
        likesInfo: {
          likesCount: filterBanUserLikes.likesInfo.likesCount,
          dislikesCount: filterBanUserLikes.likesInfo.dislikesCount,
          myStatus: getMyStatusLikeInfo,
        }
      };
    }
    return null;
  }
}