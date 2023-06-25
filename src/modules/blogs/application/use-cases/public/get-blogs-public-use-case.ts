import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaginationType, ParamsTypeClassModel } from "../../../../../types/types";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogDocument } from "../../../domain/entities/blogs.schema";
import { UsersRepository } from "../../../../users/infrastructure/users.repository";
import { GetBlogsPublicFilter } from "../../../../../utils/filters/blog.filters";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";

export class GetBlogsCommand {
  constructor(
    public query: ParamsTypeClassModel
  ) {
  }
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsPublicUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: GetBlogsCommand): Promise<PaginationType<BlogDocument[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const banBlogs = await this.blogsQueryRepository.getArrayIdBanBlogs();
    const filter = GetBlogsPublicFilter(banUsers, banBlogs, searchNameTerm);
    const getTotalCountBlogs = await this.blogsQueryRepository.getTotalCountBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsQueryRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}