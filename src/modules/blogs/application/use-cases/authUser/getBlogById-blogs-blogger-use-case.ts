import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/type/users.schema";
import { BlogDocument } from "../../../type/blogs.schema";
import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogsRepository } from "../../blogs.repository";
import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Types } from "mongoose";
import { BlogType } from "../../../type/blogsType";


export class GetBlogByIdCommand {
  constructor(
    public id: string,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdByBloggerUseCase implements ICommandHandler<GetBlogByIdCommand>{
  constructor(protected blogsRepository: BlogsRepository,) {
  }
  async execute(command: GetBlogByIdCommand): Promise<BlogType> {
    const blogId = new Types.ObjectId(command.id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    // if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership
    };
  }
}