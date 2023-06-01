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


export class CreatePostCommand {
  constructor(
    public dto: CreatePostInputClassModel,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: CreatePostCommand): Promise<outputPostModelType | null> {
    await validateOrRejectModel(command.dto, CreatePostInputClassModel);
    const blogId = new Types.ObjectId(command.dto.blogId);
    const getBlog = await this.blogsRepository.findBlogById(blogId);
    const createPost = await this.postsRepository.createPost(command.dto, getBlog,command.user);
    return {
      id: createPost._id.toString(),
      title: createPost.title,
      shortDescription: createPost.shortDescription,
      content: createPost.content,
      blogId: createPost.blogId,
      blogName: createPost.blogName,
      createdAt: createPost.createdAt,
      extendedLikesInfo: {
        likesCount: createPost.extendedLikesInfo.likesCount,
        dislikesCount: createPost.extendedLikesInfo.dislikesCount,
        myStatus: createPost.extendedLikesInfo.myStatus,
        newestLikes: createPost.extendedLikesInfo.newestLikes
      }
    };
  }
}