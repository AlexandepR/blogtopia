import { UserDocument } from "../../../../users/type/users.schema";
import { BlogsRepository } from "../../blogs.repository";
import { HttpException, HttpStatus } from "@nestjs/common";
import { BlogInputClassModel, BlogType } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class CreateBlogCommand {
  constructor(
    public user: UserDocument,
    public dto: BlogInputClassModel
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogByBloggerUseCase implements ICommandHandler<CreateBlogCommand>{
  constructor(protected blogsRepository: BlogsRepository) {
  }
  async execute(command: CreateBlogCommand): Promise<BlogType> {
    await validateOrRejectModel(command.dto, BlogInputClassModel);
    const createBlog = await this.blogsRepository.createBlog(command.dto,command.user);
    if (!createBlog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return {
      id: createBlog._id.toString(),
      name: createBlog.name,
      description: createBlog.description,
      websiteUrl: createBlog.websiteUrl,
      createdAt: createBlog.createdAt,
      isMembership: createBlog.isMembership
    };
  }
}