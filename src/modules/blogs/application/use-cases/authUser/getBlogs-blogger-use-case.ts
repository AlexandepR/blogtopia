import { PaginationType, ParamsType } from '../../../../../types/types';
import { pagesCounter, parseQueryPaginator, skipPage } from '../../../../../utils/helpers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { UserType } from '../../../../users/type/usersTypes';
import { BlogType } from '../../../type/blogsType';
import { filterGetBlogsByBlogger } from '../../../../../utils/filters/blog.filters';
import { UnauthorizedException } from '@nestjs/common';


export class GetBlogsCommand {
  constructor(
    public query: ParamsType,
    public user: UserType,
  ) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsByBloggerUseCase implements ICommandHandler<GetBlogsCommand>{
  constructor(
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository) {}
  async execute(command: GetBlogsCommand): Promise<PaginationType<BlogType[]>> {
    if(!command.user) {throw new UnauthorizedException()}
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const filter = filterGetBlogsByBlogger(command.query, command.user.ID);
    const getTotalCountBlogs = await this.blogsQuerySqlRepository.getTotalCountBlogs(searchNameTerm, command.user.ID);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsQuerySqlRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection, command.user.ID);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}