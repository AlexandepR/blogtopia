import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginationType, ParamsType, ParamsTypeClassModel } from '../../../../../types/types';
import { pagesCounter, parseQueryPaginator, skipPage } from '../../../../../utils/helpers';
import { GetBlogsPublicFilter } from '../../../../../utils/filters/blog.filters';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { UsersSqlRepository } from '../../../../users/infrastructure/users.sql-repository';
import { BlogType } from '../../../type/blogsType';

export class GetBlogsCommand {
  constructor(
    public query: ParamsType
  ) {
  }
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsPublicUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }
  async execute(command: GetBlogsCommand): Promise<PaginationType<BlogType[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const filter = GetBlogsPublicFilter(searchNameTerm);
    const getTotalCountBlogs = await this.blogsQuerySqlRepository.getTotalCountPublicBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsQuerySqlRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}