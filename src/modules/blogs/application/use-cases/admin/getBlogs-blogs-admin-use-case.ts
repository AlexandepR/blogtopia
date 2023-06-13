import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/type/users.schema";
import { BlogDocument } from "../../../type/blogs.schema";
import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogsRepository } from "../../blogs.repository";
import { Injectable } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";


export class getBlogsByAdminCommand {
  constructor(
    public query: ParamsType,
  ) {}
}

@CommandHandler(getBlogsByAdminCommand)
export class GetBlogsByAdminUseCase implements ICommandHandler<getBlogsByAdminCommand>{
  constructor(protected blogsRepository: BlogsRepository,) {
  }
  async execute(command: getBlogsByAdminCommand): Promise<PaginationType<BlogDocument[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {};
    const getTotalCountBlogs = await this.blogsRepository.getTotalCountBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection, true);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };
  }
}