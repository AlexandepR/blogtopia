import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param, Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { BasicAuth, UserFromRequestDecorator } from "../../../utils/public.decorator";
import { CreateUserInputClassModel, InfoBanStatusClassModel, ParamsUsersType } from "../type/usersTypes";
import { GetUsersByAdminCommand } from "../application/use-cases/admin/get-users.use-case";
import { CommandBus } from "@nestjs/cqrs";
import {
  UpdateBanInfoByAdminCommand
} from "../application/use-cases/admin/update-ban-status.use-case";
import { CheckLoginOrEmailGuard } from "../../../middleware/middleware";
import { CreateUserByAdminCommand } from "../application/use-cases/admin/create-user.use-case";
import { checkObjectId } from "../../../utils/validation.helpers";
import { DeleteUserByAdminCommand } from "../application/use-cases/admin/delete-user.use-case";
import { DeleteAllUsersByAdminCommand } from "../application/use-cases/admin/delete-all.use-case";
import { UsersRepository } from "../infrastructure/users.repository";
import { BanInfoInputClassModel } from "../../blogs/type/blogsType";
import {
  UpdateBanStatusCommand
} from "../application/use-cases/authUser/update-ban-status-blog.use-case";
import { UserDocument } from "../domain/entities/users.schema";
import { ParamsType } from "../../../types/types";
import { getBannedUsersForBlogCommand } from "../application/use-cases/authUser/get-ban-users-forBlog.use-case";


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
    @UserFromRequestDecorator() user: UserDocument,
    @Query() query: ParamsType
  ) {
    const command = new getBannedUsersForBlogCommand(blogId, query, user);
    return await this.commandBus.execute(command);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":userId/ban")
  async updateBanStatus(
    @Param("userId") userId: string,
    @UserFromRequestDecorator() user: UserDocument,
    @Body() dto: BanInfoInputClassModel
  ) {
    const command = new UpdateBanStatusCommand(userId, dto, user);
    return await this.commandBus.execute(command);
  }
}