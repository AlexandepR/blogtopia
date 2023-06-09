import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../users/infrastructure/users.repository";
import { BanInfoBlogInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { validateObjectId } from "../../../../../utils/helpers";
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";


export class UpdateBanInfoBlogCommand {
  constructor(
    public dto: BanInfoBlogInputClassModel,
    public blogId: string,
  ) {}
}

@CommandHandler(UpdateBanInfoBlogCommand)
export class UpdateBanInfoBlogUseCase implements ICommandHandler<UpdateBanInfoBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: UpdateBanInfoBlogCommand) {
    await validateOrRejectModel(command.dto, BanInfoBlogInputClassModel)
    const blogObjectId = validateObjectId(command.blogId)
    const blog = await this.blogsQueryRepository.findBlogById(blogObjectId)
    if(!blog) throw new NotFoundException()
    if(command.dto.isBanned) {
      if(blog.banInfo.isBanned) throw new HttpException('',HttpStatus.NO_CONTENT)
      blog.banBlog(command.dto.isBanned)
    } else {
      if(!blog.banInfo.isBanned) throw new HttpException('',HttpStatus.NO_CONTENT)
      blog.banBlog(command.dto.isBanned)
    }

    return await this.blogsRepository.save(blog)
  }
}