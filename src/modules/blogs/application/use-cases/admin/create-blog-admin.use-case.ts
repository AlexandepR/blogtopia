import { HttpException, HttpStatus } from "@nestjs/common";
import { BlogInputClassModel, BlogResponseType } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsOrmRepository } from "../../../infrastructure/blogs.orm-repository";

export class CreateBlogByAdminCommand {
  constructor(
    public dto: BlogInputClassModel
  ) {
  }
}

@CommandHandler(CreateBlogByAdminCommand)
export class CreateBlogByAdminUseCase implements ICommandHandler<CreateBlogByAdminCommand> {
  constructor(protected blogsOrmRepository: BlogsOrmRepository) {
  }
  async execute({ dto }: CreateBlogByAdminCommand): Promise<BlogResponseType> {
    await validateOrRejectModel(dto, BlogInputClassModel);
    const createBlog = await this.blogsOrmRepository.createBlogByAdmin(dto);
    if (!createBlog) throw new HttpException("", HttpStatus.BAD_REQUEST);
    return createBlog;
  }
}