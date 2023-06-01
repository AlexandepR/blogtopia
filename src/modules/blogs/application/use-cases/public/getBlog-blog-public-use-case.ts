import { PaginationType, ParamsType } from "../../../../../types/types";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../blogs.repository";
import { PostsRepository } from "../../../../posts/application/posts.repository";
import { JwtService } from "../../../../auth/application/jwt.service";
import { PostsTypeFiltered } from "../../../../posts/type/postsType";
import { Types } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";
import { BlogType } from "../../../type/blogsType";

export class GetBlogCommand {
  constructor(
    public id: string,
  ) {}
}


@CommandHandler(GetBlogCommand)
export class GetBlogUseCase implements ICommandHandler<GetBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: GetBlogCommand): Promise<BlogType> {
    const blogId = new Types.ObjectId(command.id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return {
      id: command.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership
    };
  }
}