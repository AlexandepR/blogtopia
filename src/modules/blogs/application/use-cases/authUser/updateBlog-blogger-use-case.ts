import { BlogDocument } from "../../../domain/entities/blogs.schema";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { BlogInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";


export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public UpdateBlogDto: BlogInputClassModel,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogByBloggerUseCase implements ICommandHandler<UpdateBlogCommand>{
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }
  async execute(command: UpdateBlogCommand): Promise<BlogDocument> {
    await validateOrRejectModel(command.UpdateBlogDto, BlogInputClassModel);
    if(!Types.ObjectId.isValid(command.blogId)) {throw new NotFoundException()}
    const blogId = new Types.ObjectId(command.blogId);
    // const filterIsOwn = ({'blogOwnerInfo.userLogin': command.user.accountData.login})
    const blog = await this.blogsQueryRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    blog.updateBlog(command.UpdateBlogDto);
    return await blog.save();
  }
}