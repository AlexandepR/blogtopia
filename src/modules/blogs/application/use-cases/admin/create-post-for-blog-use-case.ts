import { BadRequestException, ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { PostForBlogInputClassModel } from "../../../type/blogsType";
import { outputPostModelType } from "../../../../posts/type/postsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateIdByUUID } from "../../../../../utils/helpers";
import { BlogsOrmQueryRepository } from "../../../infrastructure/blogs.orm.query-repository";
import { PostsOrmRepository } from "../../../../posts/infrastructure/posts.orm-repository";


export class CreatePostForBlogByAdminCommand {
  constructor(
    public dto: PostForBlogInputClassModel,
    public id: string
  ) {
  }
}

@CommandHandler(CreatePostForBlogByAdminCommand)
export class CreatePostForBlogByAdminUseCase implements ICommandHandler<CreatePostForBlogByAdminCommand> {
  constructor(
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
    protected postsOrmRepository: PostsOrmRepository
  ) {
  }
  async execute({ dto, id }: CreatePostForBlogByAdminCommand)
    : Promise<outputPostModelType> {
    await validateOrRejectModel(dto, PostForBlogInputClassModel);
    const blogId = validateIdByUUID(id);
    if (!blogId) throw new HttpException("", HttpStatus.NOT_FOUND);
    const getBlog = await this.blogsOrmQueryRepository.findBlogById(blogId);
    if (!getBlog) throw new NotFoundException();
    if (getBlog.BlogOwnerLogin !== "admin") throw new ForbiddenException();
    const post = await this.postsOrmRepository.createPostByAdmin(dto, getBlog);
    if (post) {
      return post;
    } else {
      throw new BadRequestException();
    }
  }
}