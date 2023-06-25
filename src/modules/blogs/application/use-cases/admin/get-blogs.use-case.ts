import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogDocument } from "../../../domain/entities/blogs.schema";
import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { Injectable } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";


export class getBlogsByAdminCommand {
  constructor(
    public query: ParamsType,
  ) {}
}

@CommandHandler(getBlogsByAdminCommand)
export class GetBlogsByAdminUseCase implements ICommandHandler<getBlogsByAdminCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    ) {
  }
  async execute(command: getBlogsByAdminCommand): Promise<PaginationType<BlogDocument[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {};
    const getTotalCountBlogs = await this.blogsQueryRepository.getTotalCountBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsQueryRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection, true);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}