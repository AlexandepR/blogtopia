import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogDocument } from "../../../domain/entities/blogs.schema";
import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { Injectable } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";


export class GetBlogsCommand {
  constructor(
    public query: ParamsType,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsByBloggerUseCase implements ICommandHandler<GetBlogsCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    ) {
  }
  async execute(command: GetBlogsCommand): Promise<PaginationType<BlogDocument[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const userLogin = command.user ? command.user.accountData.login : ''
    const filter = filterByNameTermOrUserLogin(searchNameTerm,"blogOwnerInfo", userLogin)
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