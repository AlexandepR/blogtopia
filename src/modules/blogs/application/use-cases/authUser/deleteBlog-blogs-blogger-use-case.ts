import { HttpException, HttpStatus } from "@nestjs/common";
import { BlogsRepository } from "../../blogs.repository";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteBlogCommand {
  constructor(
    public id: string
  ){}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogByBloggerUseCase implements ICommandHandler<DeleteBlogCommand>{
  constructor(protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const blogId = new Types.ObjectId(command.id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return await this.blogsRepository.delete(blogId);
  }
}