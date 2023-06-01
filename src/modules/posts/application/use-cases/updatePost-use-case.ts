import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import {
  idParamsValidator,
  pagesCounter,
  parseQueryPaginator,
  skipPage,
  updatePostLikesInfo
} from "../../../../utils/helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import {
  CreatePostInputClassModel,
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
import { BlogsRepository } from "../../../blogs/application/blogs.repository";
import { PostDocument } from "../../type/posts.schema";


export class UpdatePostCommand {
  constructor(
    public dto: CreatePostInputClassModel,
    public id: string,
  ) {
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
  ) {
  }
  async execute(command: UpdatePostCommand): Promise<PostDocument> {
    await validateOrRejectModel(command.dto, CreatePostInputClassModel);
    const postId = new Types.ObjectId(command.id);
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
    await post.updatePost(command.dto);
    return await post.save();
  }
}