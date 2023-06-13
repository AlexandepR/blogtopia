import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import { CreatePostInputClassModel, outputPostModelType } from "../../type/postsType";
import { PostsRepository } from "../posts.repository";
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