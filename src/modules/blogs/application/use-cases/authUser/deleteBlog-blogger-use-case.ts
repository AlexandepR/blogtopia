import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public user: UserDocument
  ){}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogByBloggerUseCase implements ICommandHandler<DeleteBlogCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    if(!Types.ObjectId.isValid(command.id)) {throw new NotFoundException()}
    const blogId = new Types.ObjectId(command.id);
    const blog = await this.blogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    return await this.blogsRepository.deleteBlog(blogId);
  }
}