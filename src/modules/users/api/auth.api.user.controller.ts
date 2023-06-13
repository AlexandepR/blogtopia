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
import { GetUsersByAdminCommand } from "../application/use-cases/admin/getUsers-admin-use-case";
import { CommandBus } from "@nestjs/cqrs";
import {
  UpdateBanInfoByAdminCommand
} from "../application/use-cases/admin/updateUserBanStatus-admin-use-case";
import { CheckLoginOrEmailGuard } from "../../../middleware/middleware";
import { CreateUserByAdminCommand } from "../application/use-cases/admin/createUser-admin-use-case";
import { checkObjectId } from "../../../utils/validation.helpers";
import { DeleteUserByAdminCommand } from "../application/use-cases/admin/deleteUser-admin-use-case";
import { DeleteAllUsersByAdminCommand } from "../application/use-cases/admin/deleteAllUsers-admin-use-case";
import { UsersRepository } from "../application/users.repository";
import { BanInfoInputClassModel } from "../../blogs/type/blogsType";
import {
  UpdateBanStatusCommand
} from "../application/use-cases/authUser/updateBanStatusBlog-blogger-use-case";
import { UserDocument } from "../type/users.schema";
import { ParamsType } from "../../../types/types";
import { getBannedUsersForBlogCommand } from "../application/use-cases/authUser/getBannedUsersForBlog-blogger-use-case";


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