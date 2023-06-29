import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { CreatePostInputClassModel, outputPostModelType } from "../../type/postsType";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { BlogsRepository } from "../../../blogs/infrastructure/blogs.repository";
import { BlogsQueryRepository } from "../../../blogs/infrastructure/blogs.query-repository";


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
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }
  async execute(command: CreatePostCommand): Promise<outputPostModelType | null> {
    await validateOrRejectModel(command.dto, CreatePostInputClassModel);
    const blogId = new Types.ObjectId(command.dto.blogId);
    const getBlog = await this.blogsQueryRepository.findBlogById(blogId);
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