import { PaginationType, ParamsType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogDocument } from "../../../domain/blogs.schema";
import {
  filterByNameTermOrUserLogin,
  pagesCounter,
  parseQueryPaginator,
  skipPage,
  validateIdByUUID
} from '../../../../../utils/helpers';
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Types } from "mongoose";
import { UsersRepository } from "../../../../users/infrastructure/users.repository";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { UsersSqlRepository } from '../../../../users/infrastructure/users.sql-repository';


export class BindUserToBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(BindUserToBlogCommand)
export class BindUserToBlogByAdminUseCase implements ICommandHandler<BindUserToBlogCommand>{
  constructor(
    protected blogsSqlRepository: BlogsSqlRepository,
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
    ) {
  }
  async execute(command: BindUserToBlogCommand): Promise<boolean> {
    if(!validateIdByUUID(command.blogId) || !validateIdByUUID(command.userId)) {throw new NotFoundException()}
    const blog = await this.blogsQuerySqlRepository.findBlogById(command.blogId)
    const user = await this.usersSqlRepository.findUserById(command.userId)
    if (blog.BlogOwnerId !== '' || !blog || !user) throw new BadRequestException()
    return await this.blogsSqlRepository.bindUserToBlog(command.blogId, user)
  }
}