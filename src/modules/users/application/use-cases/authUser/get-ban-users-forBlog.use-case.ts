import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginationType, ParamsType } from '../../../../../types/types';
import { pagesCounter, parseQueryPaginator, skipPage, validateIdByUUID } from '../../../../../utils/helpers';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FindUserType, GetBanUserForBlog } from '../../../type/usersTypes';
import { BlogsQuerySqlRepository } from '../../../../blogs/infrastructure/blogs.sql.query-repository';
import { BlogsSqlRepository } from '../../../../blogs/infrastructure/blogs.sql-repository';


export class getBannedUsersForBlogCommand {
  constructor(
      public blogId: string,
      public query: ParamsType,
      public user: FindUserType,
  ) {
  }
}

@CommandHandler(getBannedUsersForBlogCommand)
export class getBannedUsersForBlogUseCase implements ICommandHandler<getBannedUsersForBlogCommand>{
  constructor(
    protected blogsSqlRepository: BlogsSqlRepository,
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
  ) {
  }
  async execute(command: getBannedUsersForBlogCommand): Promise<PaginationType<GetBanUserForBlog>> {
    const { searchLoginTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    if(!validateIdByUUID(command.blogId)) {throw new NotFoundException()}
    const blog = await this.blogsQuerySqlRepository.findBlogById(command.blogId)
    if(!blog) throw new NotFoundException()
    if(blog.BlogOwnerLogin !== command.user.login) throw new ForbiddenException()
    const getTotalCountBlogs = await this.blogsQuerySqlRepository
        .getTotalCountBanUsersBlogs(command.blogId, searchLoginTerm);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsQuerySqlRepository
        .getBannedUsers(skip, pageSize, sortBy, sortDirection, searchLoginTerm, command.blogId);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}