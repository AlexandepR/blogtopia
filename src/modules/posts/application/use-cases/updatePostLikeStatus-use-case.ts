import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { updatePostLikesInfo } from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import { likeStatusInputClassModel, PostLikesType, PostsNewestLikesType } from "../../type/postsType";
import { UsersRepository } from "../../../users/application/users.repository";
import { PostsRepository } from "../posts.repository";


export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: likeStatusInputClassModel,
    public id: string,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<UpdatePostLikeStatusCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
  ) {
  }
  async execute(command: UpdatePostLikeStatusCommand): Promise<boolean> {
    await validateOrRejectModel(command.dto, likeStatusInputClassModel);
    const userId = command.user._id;
    const postId = new Types.ObjectId(command.id)
    const likeStatus = command.dto.likeStatus
    const post = await this.postsRepository.findPostById(postId);
    if (!userId || !post) if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
    const user =  await this.usersRepository.findUserById(userId)
    const {accountData: { login: userLogin }} = user!

    const newDate = new Date().toISOString();
    const newLikesData: PostLikesType = {
      _id: new Types.ObjectId(),
      createdAt: newDate,
      userId: userId,
      userLogin: userLogin,
    };
    const newestLike: PostsNewestLikesType = {
      description: '',
      addedAt: newDate,
      userId: new Types.ObjectId(userId),
      login: userLogin
    };
    if (likeStatus === 'Like') {
      const checkDislikes = await this.postsRepository.checkLikesInfo(postId, userId, 'dislikesData');
      if (checkDislikes) {
        const post = await this.postsRepository.findPostById(postId);
        const updatePostLikesCount = updatePostLikesInfo(post!, likeStatus, newLikesData);
        return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
      }
      await this.postsRepository.checkLikesInfo(postId, userId, 'likesData');
      await this.postsRepository.checkNewestLikes(postId, userId);
      await this.postsRepository.updateNewestLikes(postId, newestLike);
      const getPost = await this.postsRepository.findPostById(postId);
      const updatePostLikesCount = updatePostLikesInfo(getPost!, likeStatus, newLikesData);
      return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
    }
    if (likeStatus === 'Dislike') {
      const checkLikes = await this.postsRepository.checkLikesInfo(postId, userId, 'likesData');
      if (checkLikes) {
        await this.postsRepository.checkNewestLikes(postId, userId);
        const post = await this.postsRepository.findPostById(postId);
        const updatePostLikesCount = updatePostLikesInfo(post!, likeStatus, newLikesData);
        return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
      }
      await this.postsRepository.checkLikesInfo(postId, userId, 'dislikesData');
      const getPost = await this.postsRepository.findPostById(postId);
      const updatePostLikesCount = updatePostLikesInfo(getPost!, likeStatus, newLikesData);
      return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
    }
    if (likeStatus === 'None') {
      await this.postsRepository.checkLikesInfo(postId, userId, 'dislikesData');
      await this.postsRepository.checkLikesInfo(postId, userId, 'likesData');
      await this.postsRepository.checkNewestLikes(postId, userId);
      const post = await this.postsRepository.findPostById(postId);
      const updatePostLikesCount = updatePostLikesInfo(post!, likeStatus, newLikesData);
      return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
    }
    return false;
  }
}