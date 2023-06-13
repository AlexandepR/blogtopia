import { BlogsRepository } from "../../../../blogs/application/blogs.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ParamsType } from "../../../../../types/types";
import { pagesCounter, parseQueryPaginator, skipPage, validateObjectId } from "../../../../../utils/helpers";
import { totalCountBanUsersForBlogFilter } from "../../../../../utils/filters/user.filters";
import { Types } from "mongoose";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { UserDocument } from "../../../type/users.schema";


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
  constructor(protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: getBannedUsersForBlogCommand): Promise<any> {
    // await validateOrRejectModel(command.dto, BanInfoInputClassModel)
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const blogObjectId = validateObjectId(command.blogId)
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.blogId))
    if(!blog) throw new NotFoundException()
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    const filter = totalCountBanUsersForBlogFilter(searchNameTerm, true, blogObjectId)
    const getTotalCountBlogs = await this.blogsRepository.getTotalCountBanUsersBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsRepository.getBannedUsers(skip, pageSize, filter, sortBy, sortDirection);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}