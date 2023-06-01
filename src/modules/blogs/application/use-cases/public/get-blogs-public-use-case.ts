import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaginationType, ParamsType, ParamsTypeClassModel } from "../../../../../types/types";
import { BlogsRepository } from "../../blogs.repository";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogDocument } from "../../../type/blogs.schema";
import { UsersRepository } from "../../../../users/application/users.repository";

export class GetBlogsCommand {
  constructor(
    public query: ParamsTypeClassModel,
  ) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsPublicUseCase implements ICommandHandler<GetBlogsCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    ) {
  }
  async execute(command: GetBlogsCommand): Promise<PaginationType<BlogDocument[]>> {
      const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const filter = ({
      $or: [
        { "blogOwnerInfo.userLogin": { $nin: banUsers } },
        { name: { $regex: `${searchNameTerm}`, $options: "i" } },
      ]
    });
      // const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {};
      const getTotalCountBlogs = await this.blogsRepository.getTotalCountBlogs(filter);
      const skip = skipPage(pageNumber, pageSize);
      const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
      const getBlogs = await this.blogsRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection);
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: getTotalCountBlogs,
        items: getBlogs
      };
    }
}