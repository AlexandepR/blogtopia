import { BlogDocument } from "../../../type/blogs.schema";
import { BlogsRepository } from "../../blogs.repository";
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { BlogInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../../users/type/users.schema";


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
  constructor(protected blogsRepository: BlogsRepository,
  ) {
  }
  async execute(command: UpdateBlogCommand): Promise<BlogDocument> {
    await validateOrRejectModel(command.UpdateBlogDto, BlogInputClassModel);
    if(!Types.ObjectId.isValid(command.blogId)) {throw new NotFoundException()}
    const blogId = new Types.ObjectId(command.blogId);
    const filterIsOwn = ({'blogOwnerInfo.userLogin': command.user.accountData.login})
    const blog = await this.blogsRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    console.log(blog.blogOwnerInfo.userLogin, '1');
    console.log(command.user.accountData.login, '2');
    blog.updateBlog(command.UpdateBlogDto);
    return await blog.save();
  }
}