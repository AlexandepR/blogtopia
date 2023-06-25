import { BlogsRepository } from "../../../../blogs/infrastructure/blogs.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ParamsType } from "../../../../../types/types";
import { pagesCounter, parseQueryPaginator, skipPage, validateObjectId } from "../../../../../utils/helpers";
import { totalCountBanUsersForBlogFilter } from "../../../../../utils/filters/user.filters";
import { Types } from "mongoose";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserDocument } from "../../../domain/entities/users.schema";
import { BlogsQueryRepository } from "../../../../blogs/infrastructure/blogs.query-repository";


export class getBannedUsersForBlogCommand {
  constructor(
      public blogId: string,
      public query: ParamsType,
      public user: UserDocument,
  ) {
  }
}

@CommandHandler(getBannedUsersForBlogCommand)
export class getBannedUsersForBlogUseCase implements ICommandHandler<getBannedUsersForBlogCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }
  async execute(command: getBannedUsersForBlogCommand): Promise<any> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const blogObjectId = validateObjectId(command.blogId)
    const blog = await this.blogsQueryRepository.findBlogById(new Types.ObjectId(command.blogId))
    if(!blog) throw new NotFoundException()
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    const filter = totalCountBanUsersForBlogFilter(searchNameTerm, true, blogObjectId)
    const getTotalCountBlogs = await this.blogsQueryRepository.getTotalCountBanUsersBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsQueryRepository.getBannedUsers(skip, pageSize, filter, sortBy, sortDirection);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}