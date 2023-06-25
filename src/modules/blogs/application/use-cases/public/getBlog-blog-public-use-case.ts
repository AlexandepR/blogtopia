import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { Types } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";
import { BlogType } from "../../../type/blogsType";
import { UsersRepository } from "../../../../users/infrastructure/users.repository";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";

export class GetBlogCommand {
  constructor(
    public id: string,
  ) {}
}


@CommandHandler(GetBlogCommand)
export class GetBlogUseCase implements ICommandHandler<GetBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: GetBlogCommand): Promise<BlogType> {

    const blogId = new Types.ObjectId(command.id);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const getBanBlogs = await this.blogsQueryRepository.getArrayIdBanBlogs()
    const filter = ({
      $and: [
        getBanBlogs ? { "_id" : { $nin: getBanBlogs } } : {},
        banUsers ? { "blogOwnerInfo.userLogin": { $nin: banUsers } } : {},
      ]
    });
    const blog = await this.blogsQueryRepository.findBlogByIdForBlogger(blogId,filter);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership
    };
  }
}