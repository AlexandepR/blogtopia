import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { getCommentsByPostOutputModel } from "../../type/postsType";
import { PostsRepository } from "../posts.repository";
import { PaginationType, ParamsType } from "../../../../types/types";
import { CommentsRepository } from "../../../comments/application/comments.repository";
import { UsersRepository } from "../../../users/infrastructure/users.repository";


export class GetCommentsByPostCommand {
  constructor(
    public query: ParamsType,
    public id: string,
  ) {
  }
}

@CommandHandler(GetCommentsByPostCommand)
export class GetCommentsByPostUseCase implements ICommandHandler<GetCommentsByPostCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: GetCommentsByPostCommand): Promise<PaginationType<getCommentsByPostOutputModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const postId = new Types.ObjectId(command.id);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const filter = (
      { "commentatorInfo.userLogin": { $nin: banUsers }
      });
    // const filter = (
    //   // {
    //   // $or: [
    //     { "commentatorInfo.userLogin": { $nin: banUsers } },
    //   // ]
    // // }
    // );
    const post = await this.postsRepository.findPostByIdWithFilter(postId,filter,banUsers);
    if(!post) throw new HttpException('', HttpStatus.NOT_FOUND)
    const totalCount = await this.commentsRepository.getTotalCount(postId);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCount, pageSize);

    const comments = await this.commentsRepository.getComments(
      postId,
      pageSize,
      skip,
      sortBy,
      sortDirection,
      filter,
      banUsers,
    );
    if (comments) {
      const commentsArray = comments.map((
        {
          _id, content,
          commentatorInfo: { userId, userLogin },
          createdAt, likesInfo, __v, ...rest
        }) => {
        let userStatus: "None" | "Like" | "Dislike" = "None";
        if (userId) {
          const userLike = likesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
          const userDislike = likesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
          userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
        }
        return {
          id: _id.toString(),
          content: content,
          commentatorInfo: {
            userId: userId.toString(),
            userLogin: userLogin,
          },
          createdAt: createdAt,
          likesInfo: {
            likesCount: likesInfo.likesCount,
            dislikesCount: likesInfo.dislikesCount,
            myStatus: userStatus
          }
        }});

      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCount,
        items: commentsArray
      };
    }
    return null;
  }
}