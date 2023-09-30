import { PaginationType, ParamsType } from "../../../../../types/types";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogType } from "../../../type/blogsType";
import { BlogsOrmQueryRepository } from "../../../infrastructure/blogs.orm.query-repository";


export class getBlogsByAdminCommand {
  constructor(
    public query: ParamsType,
  ) {}
}
@CommandHandler(getBlogsByAdminCommand)
export class GetBlogsByAdminUseCase implements ICommandHandler<getBlogsByAdminCommand>{
  constructor(
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository
    ) {
  }
  async execute(command: getBlogsByAdminCommand): Promise<PaginationType<BlogType[] | any> | any> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const getTotalCountBlogs = await this.blogsOrmQueryRepository.getTotalBlogsByAdmin(searchNameTerm);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsOrmQueryRepository
      .getBlogsByAdmin(skip, pageSize, searchNameTerm, sortBy, sortDirection);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}