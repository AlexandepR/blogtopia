import { BlogDocument } from "../../../type/blogs.schema";
import { BlogsRepository } from "../../blogs.repository";
import { BadRequestException, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
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
    if(!command.UpdateBlogDto) {throw new BadRequestException()}

    const blogId = new Types.ObjectId(command.blogId);
    const filterIsOwn = ({'blogOwnerInfo.userLogin': command.user.accountData.login})
    const blog = await this.blogsRepository.findBlogById(blogId,filterIsOwn);
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    blog.updateBlog(command.UpdateBlogDto);
    return await blog.save();
  }
}