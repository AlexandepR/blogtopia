import { UserDocument } from "../../../../users/type/users.schema";
import { BlogsRepository } from "../../blogs.repository";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Types } from "mongoose";
import { BlogType } from "../../../type/blogsType";


export class GetBlogByIdCommand {
  constructor(
    public id: string,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdByBloggerUseCase implements ICommandHandler<GetBlogByIdCommand>{
  constructor(protected blogsRepository: BlogsRepository,) {
  }
  async execute(command: GetBlogByIdCommand): Promise<BlogType> {
    const blogId = new Types.ObjectId(command.id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    // if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
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