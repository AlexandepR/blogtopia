import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { idParamsValidator, updatePostLikesInfo } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import {
  getCommentsByPostOutputModel,
  likeStatusInputClassModel,
  PostLikesType,
  PostsNewestLikesType
} from "../../type/postsType";
import { UsersRepository } from "../../../users/application/users.repository";
import { PostsRepository } from "../posts.repository";
import { CreateCommentInputClassModel } from "../posts.service";


export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public dto: CreateCommentInputClassModel,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
  ) {
  }
  async execute(command: CreateCommentForPostCommand): Promise<getCommentsByPostOutputModel> {
    await validateOrRejectModel(command.dto, CreateCommentInputClassModel);
    const postId = idParamsValidator(command.postId);
    if(!postId) throw new HttpException('', HttpStatus.NOT_FOUND)
    const findPost = await this.postsRepository.findPostById(postId)
    if(!findPost) throw new HttpException('', HttpStatus.NOT_FOUND)
    // const createComment = await this.postsRepository.createComment(command.dto.content, postId, command.user);
    const createComment = await this.postsRepository.createComment(command.dto.content, findPost, command.user);
    if(!createComment) throw new HttpException('', HttpStatus.NOT_FOUND)
    if (createComment) {
      return {
        id: createComment._id.toString(),
        content: createComment.content,
        commentatorInfo: {
          userId: createComment.commentatorInfo.userId.toString(),
          userLogin: createComment.commentatorInfo.userLogin
        },
        createdAt: createComment.createdAt,
        likesInfo: {
          likesCount: createComment.likesInfo.likesCount,
          dislikesCount: createComment.likesInfo.dislikesCount,
          myStatus: createComment.likesInfo.myStatus,
        }
      };
    }
    else {throw new HttpException('', HttpStatus.BAD_REQUEST)}
  }
}