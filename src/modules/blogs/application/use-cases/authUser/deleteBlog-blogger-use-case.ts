import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "../../blogs.repository";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../../users/type/users.schema";

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public user: UserDocument
  ){}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogByBloggerUseCase implements ICommandHandler<DeleteBlogCommand>{
  constructor(protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    if(!Types.ObjectId.isValid(command.id)) {throw new NotFoundException()}
    const blogId = new Types.ObjectId(command.id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    return await this.blogsRepository.deleteBlog(blogId);
  }
}