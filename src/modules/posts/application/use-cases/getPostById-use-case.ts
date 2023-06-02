import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import {
  filterBanCommentLikesInfo, filterBanPostLikesInfo, findLikeStatusForPost,
  idParamsValidator,
  pagesCounter,
  parseQueryPaginator,
  skipPage, sortNewestLikesForPost,
  updatePostLikesInfo
} from "../../../../utils/helpers";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import {
  getCommentsByPostOutputModel,
  likeStatusInputClassModel, outputPostModelType,
  PostLikesType,
  PostsNewestLikesType, PostsTypeFiltered
} from "../../type/postsType";
import { UsersRepository } from "../../../users/application/users.repository";
import { PostsRepository } from "../posts.repository";
import { CreateCommentInputClassModel } from "../posts.service";
import { PaginationType, ParamsType } from "../../../../types/types";
import { JwtService } from "../../../auth/application/jwt.service";

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    protected jwtService: JwtService,
    protected postsRepository: PostsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: GetPostByIdCommand): Promise<outputPostModelType> {
    const postId = new Types.ObjectId(command.id);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const filter = (
      // {
      // $or: [
        { "commentatorInfo.userLogin": { $nin: banUsers }
      //   },
      // ]
    });
    const post = await this.postsRepository.findPostById(postId,filter);
    if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
    const filterBanUserLikes = filterBanPostLikesInfo(post,banUsers)
    // if (filterBanUserLikes) {
    const userStatus = command.user ? findLikeStatusForPost(filterBanUserLikes, command.user._id) : 'None';
      // const userId = command.user._id;
      // // const userStatus = await this.postsRepository.findLikesStatus(postId, userId);
      // const userStatus = findLikeStatusForPost(filterBanUserLikes, userId);
      const sortNewestLikes = sortNewestLikesForPost(post)
      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.extendedLikesInfo.likesCount,
          dislikesCount: post.extendedLikesInfo.dislikesCount,
          myStatus: userStatus,
          newestLikes: sortNewestLikes
        }
      };
    // }
    throw new NotFoundException()
  }
}