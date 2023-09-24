import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Types } from "mongoose";
import { BlogType } from "../../../type/blogsType";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { validateIdByUUID } from '../../../../../utils/helpers';


export class GetBlogByIdCommand {
  constructor(
    public blogId: string,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetBlogByIdCommand)
export class GetBlogByIdByBloggerUseCase implements ICommandHandler<GetBlogByIdCommand>{
  constructor(
    protected blogsSqlRepository: BlogsSqlRepository,
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
    ) {
  }
  async execute(command: GetBlogByIdCommand): Promise<BlogType | any> {
    if(!validateIdByUUID(command.blogId)) throw new NotFoundException()
    const blog = await this.blogsQuerySqlRepository.findBlogById(command.blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    return {
      id: blog.ID,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership
    };
  }
}