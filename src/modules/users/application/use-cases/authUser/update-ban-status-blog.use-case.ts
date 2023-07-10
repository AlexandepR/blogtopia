import { BanInfoInputClassModel } from '../../../../blogs/type/blogsType';
import { validateOrRejectModel } from '../../../../../utils/validation.helpers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { validateIdByUUID } from '../../../../../utils/helpers';
import { FindUserType } from '../../../type/usersTypes';
import { BlogsQuerySqlRepository } from '../../../../blogs/infrastructure/blogs.sql.query-repository';
import { BlogsSqlRepository } from '../../../../blogs/infrastructure/blogs.sql-repository';
import { UsersSqlRepository } from '../../../infrastructure/users.sql-repository';


export class UpdateBanStatusCommand {
  constructor(
      public userId: string,
      public dto: BanInfoInputClassModel,
      public user: FindUserType,
  ) {
  }
}

@CommandHandler(UpdateBanStatusCommand)
export class UpdateBanStatusUseCase implements ICommandHandler<UpdateBanStatusCommand>{
  constructor(
    protected blogsSqlRepository: BlogsSqlRepository,
    protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }
  async execute({dto, userId, user: { login }}: UpdateBanStatusCommand): Promise<any> {
    await validateOrRejectModel(dto, BanInfoInputClassModel)
    if(!validateIdByUUID(userId)) throw new NotFoundException()
    const user = await  this.usersSqlRepository.findUserById(userId)
    const blog = await this.blogsQuerySqlRepository.findBlogById(dto.blogId)
    if(!user || !blog) throw new NotFoundException()
    if(blog.BlogOwnerLogin !== login) throw new ForbiddenException()
    const findBanUserForBlog = await this.blogsQuerySqlRepository.findBanUserForBlog(userId)
    if (findBanUserForBlog?.isBanned === dto.isBanned) throw new HttpException('', HttpStatus.NO_CONTENT)
    if (dto.isBanned) {
      return this.blogsSqlRepository.banUserForBlog(user, dto)
    } else {
      return await this.blogsSqlRepository.deleteBanUserBlog(userId)
    }
  }
}