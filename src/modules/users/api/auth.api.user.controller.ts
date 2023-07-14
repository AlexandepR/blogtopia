import { Body, Controller, Get, HttpCode, HttpStatus, Param, Put, Query } from '@nestjs/common';
import { UserFromRequestDecorator } from '../../../utils/public.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { UsersRepository } from '../infrastructure/users.repository';
import { BanInfoInputClassModel } from '../../blogs/type/blogsType';
import { UpdateBanStatusCommand } from '../application/use-cases/authUser/update-ban-status-blog.use-case';
import { UserDocument } from '../domain/entities/users.schema';
import { ParamsType } from '../../../types/types';
import { getBannedUsersForBlogCommand } from '../application/use-cases/authUser/get-ban-users-forBlog.use-case';
import { FindUserType } from '../type/usersTypes';


@Controller({
  path: "blogger/users"
})
export class UsersBloggerController {
  constructor(
    protected commandBus: CommandBus,
    protected usersRepository: UsersRepository
  ) {
  }
  @Get("/blog/:blogId")
  async getAllBannedUsersForBlog(
    @Param("blogId") blogId: string,
    @UserFromRequestDecorator() user: FindUserType,
    @Query() query: ParamsType
  ) {
    const command = new getBannedUsersForBlogCommand(blogId, query, user);
    return await this.commandBus.execute(command);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":userId/ban")
  async updateBanStatus(
    @Param("userId") userId: string,
    @UserFromRequestDecorator() user: FindUserType,
    @Body() dto: BanInfoInputClassModel
  ) {
    const command = new UpdateBanStatusCommand(userId, dto, user);
    return await this.commandBus.execute(command);
  }
}