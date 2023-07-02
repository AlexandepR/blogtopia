import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository';
import { validateIdByUUID } from '../../../../../utils/helpers';
import { FindUserType } from '../../../../users/type/usersTypes';

export class DeleteBlogCommand {
  constructor(
    public id: string,
    public user: FindUserType
  ){}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogByBloggerUseCase implements ICommandHandler<DeleteBlogCommand>{
  constructor(
    protected blogsSqlRepository: BlogsSqlRepository,
    protected BlogsQuerySqlRepository: BlogsQuerySqlRepository,
  ) {
  }
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    if(!validateIdByUUID(command.id)) {throw new NotFoundException()}
    const blogId = command.id
    const blog = await this.BlogsQuerySqlRepository.findBlogById(blogId);
    if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
    if(blog.BlogOwnerLogin !== command.user.login) throw new ForbiddenException()
    return await this.blogsSqlRepository.deleteBlog(blogId);
  }
}