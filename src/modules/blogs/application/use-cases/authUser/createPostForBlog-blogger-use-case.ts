import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { PostForBlogBloggerInputClassModel } from "../../../type/blogsType";
import { outputPostModelType } from "../../../../posts/type/postsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/application/posts.repository";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";


export class CreatePostByBlogCommand {
  constructor(
    public user: UserDocument,
    public dto: PostForBlogBloggerInputClassModel,
    public blogId: string
  ) {
  }
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogByBloggerUseCase implements ICommandHandler<CreatePostByBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsRepository: PostsRepository
  ) {
  }
  async execute(command: CreatePostByBlogCommand)
    : Promise<outputPostModelType | null> {
    await validateOrRejectModel(command.dto, PostForBlogBloggerInputClassModel);
    if (!Types.ObjectId.isValid(command.blogId)) {
      throw new NotFoundException();
    }
    const blogId = new Types.ObjectId(command.blogId);
    const getBlog = await this.blogsQueryRepository.findBlogById(blogId);
    if (!getBlog) throw new NotFoundException();
    if (getBlog.blogOwnerInfo.userLogin !== command.user.accountData.login ||
      getBlog.blogOwnerInfo.userId !== command.user._id.toString()) throw new ForbiddenException();
    // if(getBlog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    const dto = {
      ...command.dto,
      blogId: command.blogId
    };
    const createPost = await this.postsRepository.createPost(dto, getBlog, command.user);
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