import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/type/users.schema";
import { BlogDocument } from "../../../type/blogs.schema";
import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { BlogsRepository } from "../../blogs.repository";
import { BadRequestException, Injectable, Param } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Types } from "mongoose";
import { UsersRepository } from "../../../../users/application/users.repository";


export class BindUserToBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BindUserToBlogCommand)
export class BindUserToBlogByAdminUseCase implements ICommandHandler<BindUserToBlogCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    ) {
  }
  async execute(command: BindUserToBlogCommand) {
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.blogId))
    const user = await this.usersRepository.findUserById(new Types.ObjectId(command.userId))
    if (blog.blogOwnerInfo.userId !== '' || !blog || !user) throw new BadRequestException()
    blog.bindUserToBlog(user)
    return await this.blogsRepository.save(blog);
  }
}