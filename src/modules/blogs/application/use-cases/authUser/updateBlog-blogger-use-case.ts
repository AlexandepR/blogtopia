import { BlogDocument } from "../../../domain/blogs.schema";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { BlogInputClassModel } from "../../../type/blogsType";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";
import { FindUserType } from '../../../../users/type/usersTypes';
import { validateIdByUUID } from '../../../../../utils/helpers';
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';


export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public updateBlogDto: BlogInputClassModel,
    public user: FindUserType,
  ) {
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogByBloggerUseCase implements ICommandHandler<UpdateBlogCommand>{
  constructor(
    protected blogsSqlRepository: BlogsSqlRepository,
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
  ) {
  }
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    await validateOrRejectModel(command.updateBlogDto, BlogInputClassModel);
    if(!validateIdByUUID(command.blogId)) {throw new NotFoundException()}
    const blog = await this.blogsQuerySqlRepository.findBlogById(command.blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.BlogOwnerLogin !== command.user.login) throw new ForbiddenException()
    return await this.blogsSqlRepository.updateBlog(command.updateBlogDto, command.blogId)
  }
}