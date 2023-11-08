import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../infrastructure/blogs.repository';
import { Types } from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { BlogsQueryRepository } from '../../../infrastructure/blogs.query-repository';
import { UserType } from '../../../../users/type/usersTypes';
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { PostsSqlRepository } from '../../../../posts/infrastructure/posts.sql-repository';
import { validateIdByUUID } from '../../../../../utils/helpers';

export class DeletePostByBlogCommand {
  constructor(
      public blogId: string,
      public postId: string,
      public user: UserType,
  ){}
}

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogByBloggerUseCase implements ICommandHandler<DeletePostByBlogCommand>{
  constructor(
    private blogsSqlRepository: BlogsSqlRepository,
    private blogsQuerySqlRepository: BlogsQuerySqlRepository,
    private postsSqlRepository: PostsSqlRepository,
  ) {
  }
  async execute(command: DeletePostByBlogCommand): Promise<boolean> {
    if(!validateIdByUUID(command.blogId) || !validateIdByUUID(command.postId)) {throw new NotFoundException()}
    const blog = await this.blogsQuerySqlRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException()
    const post = await this.postsSqlRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException()
    if(post.postOwnerLogin !== command.user.login ||
      post.postOwnerId !== command.user.ID) throw new ForbiddenException()
    return await this.postsSqlRepository.delete(command.postId);
  }
}