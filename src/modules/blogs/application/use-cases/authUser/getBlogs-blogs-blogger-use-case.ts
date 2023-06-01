import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/type/users.schema";
import { BlogDocument } from "../../../type/blogs.schema";
import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogsRepository } from "../../blogs.repository";
import { Injectable } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";


export class GetBlogsCommand {
  constructor(
    public query: ParamsType,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsByBloggerUseCase implements ICommandHandler<GetBlogsCommand>{
  constructor(protected blogsRepository: BlogsRepository,) {
  }
  async execute(command: GetBlogsCommand): Promise<PaginationType<BlogDocument[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const userLogin = command.user ? command.user.accountData.login : ''
    const filter = filterByNameTermOrUserLogin(searchNameTerm,"blogOwnerInfo", userLogin)
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