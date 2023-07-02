import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PostForBlogBloggerInputClassModel } from '../../../type/blogsType';
import { outputPostModelType } from '../../../../posts/type/postsType';
import { validateOrRejectModel } from '../../../../../utils/validation.helpers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { validateIdByUUID } from '../../../../../utils/helpers';
import { FindUserType } from '../../../../users/type/usersTypes';
import { PostsSqlRepository } from '../../../../posts/infrastructure/posts.sql-repository';


export class CreatePostByBlogCommand {
  constructor(
    public user: FindUserType,
    public dto: PostForBlogBloggerInputClassModel,
    public blogId: string
  ) {
  }
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogByBloggerUseCase implements ICommandHandler<CreatePostByBlogCommand> {
  constructor(
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
    protected postsSqlRepository: PostsSqlRepository
  ) {
  }
  async execute(command: CreatePostByBlogCommand)
    : Promise<outputPostModelType> {
    await validateOrRejectModel(command.dto, PostForBlogBloggerInputClassModel);
    const blogId = validateIdByUUID(command.blogId)
    if(!blogId) throw new HttpException("", HttpStatus.NOT_FOUND);
    const getBlog = await this.blogsQuerySqlRepository.findBlogById(blogId);
    if (!getBlog) throw new NotFoundException();
    if (getBlog.BlogOwnerLogin !== command.user.login ||
      getBlog.BlogOwnerId !== command.user.ID) throw new ForbiddenException();
    const dto = {
      ...command.dto,
      blogId: command.blogId
    };
    const post = await this.postsSqlRepository.createPost(dto, getBlog, command.user);
    return {
      id: post.ID,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.myStatus,
        newestLikes: [{
          addedAt: "2023-06-30T11:40:50.588Z",
          userId: "string",
          login: "string"
        }]
      }
    };
  }
}