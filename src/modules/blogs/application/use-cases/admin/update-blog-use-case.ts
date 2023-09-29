import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { BlogInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateIdByUUID } from "../../../../../utils/helpers";
import { BlogsOrmRepository } from "../../../infrastructure/blogs.orm-repository";
import { BlogsOrmQueryRepository } from "../../../infrastructure/blogs.orm.query-repository";


export class UpdateBlogByAdminCommand {
  constructor(
    public blogId: string,
    public updateBlogDto: BlogInputClassModel
  ) {
  }
}

@CommandHandler(UpdateBlogByAdminCommand)
export class UpdateBlogByAdminUseCase implements ICommandHandler<UpdateBlogByAdminCommand> {
  constructor(
    protected blogsOrmRepository: BlogsOrmRepository,
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository
  ) {
  }
  async execute({ blogId, updateBlogDto }: UpdateBlogByAdminCommand): Promise<boolean> {
    await validateOrRejectModel(updateBlogDto, BlogInputClassModel);
    if (!validateIdByUUID(blogId)) throw new NotFoundException();
    const blog = await this.blogsOrmQueryRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if (blog.BlogOwnerLogin !== "admin") throw new ForbiddenException();
    return await this.blogsOrmRepository.updateBlog(updateBlogDto, blogId);
  }
}