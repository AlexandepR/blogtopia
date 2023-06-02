import { BlogDocument } from "../../../type/blogs.schema";
import { BlogsRepository } from "../../blogs.repository";
import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { BlogInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";


export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public UpdateBlogDto: BlogInputClassModel,
  ) {
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogByBloggerUseCase implements ICommandHandler<UpdateBlogCommand>{
  constructor(protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: UpdateBlogCommand): Promise<BlogDocument> {
    await validateOrRejectModel(command.UpdateBlogDto, BlogInputClassModel);
    if(!command.UpdateBlogDto) {throw new BadRequestException()}
    const blogId = new Types.ObjectId(command.blogId);
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    blog.updateBlog(command.UpdateBlogDto);
    return await this.blogsRepository.save(blog);
  }
}