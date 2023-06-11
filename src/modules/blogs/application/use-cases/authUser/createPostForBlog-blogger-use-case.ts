import { UserDocument } from "../../../../users/type/users.schema";
import { BlogsRepository } from "../../blogs.repository";
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { createPostForBlogInputClassModel } from "../../../type/blogsType";
import { outputPostModelType } from "../../../../posts/type/postsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/application/posts.repository";


export class CreatePostByBlogCommand {
  constructor(
    public user: UserDocument,
    public dto: createPostForBlogInputClassModel,
    public blogId: string
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogByBloggerUseCase implements ICommandHandler<CreatePostByBlogCommand>{
  constructor(protected blogsRepository: BlogsRepository,
              protected postsRepository: PostsRepository,
              ) {
  }
  async execute(command: CreatePostByBlogCommand)
    : Promise<outputPostModelType | null> {
    await validateOrRejectModel(command.dto, createPostForBlogInputClassModel);
    if(!Types.ObjectId.isValid(command.blogId)) {throw new NotFoundException()}
    const blogId = new Types.ObjectId(command.blogId)
    const getBlog = await this.blogsRepository.findBlogById(blogId);
    if(!getBlog) throw new NotFoundException()
    if(getBlog.blogOwnerInfo.userLogin !== command.user.accountData.login ||
      getBlog.blogOwnerInfo.userId !== command.user._id.toString()) throw new ForbiddenException()
    // if(getBlog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    const dto = {
      ...command.dto,
      blogId: command.blogId
    }
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