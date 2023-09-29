import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateIdByUUID } from "../../../../../utils/helpers";
import { BlogsOrmRepository } from "../../../infrastructure/blogs.orm-repository";
import { BlogsOrmQueryRepository } from "../../../infrastructure/blogs.orm.query-repository";

export class DeleteBlogByAdminCommand {
  constructor(
    public id: string,
  ){}
}

@CommandHandler(DeleteBlogByAdminCommand)
export class DeleteBlogByAdminUseCase implements ICommandHandler<DeleteBlogByAdminCommand>{
  constructor(
    protected blogsOrmRepository: BlogsOrmRepository,
    protected BlogsQueryOrmRepository: BlogsOrmQueryRepository,
  ) {
  }
  async execute({id: blogId}: DeleteBlogByAdminCommand): Promise<boolean> {
    if(!validateIdByUUID(blogId)) throw new NotFoundException()
    const blog = await this.BlogsQueryOrmRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.BlogOwnerLogin !== 'admin') throw new ForbiddenException()
    return await this.blogsOrmRepository.deleteBlog(blogId);
  }
}