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
import { BasicAuth } from "../../../utils/public.decorator";
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


@BasicAuth()
@Controller({
  path: "sa/users"
})
export class UsersAdminController {
  constructor(
    protected commandBus: CommandBus,
    protected usersRepository: UsersRepository
  ) {
  }
  @Get()
  async getUsers(
    @Query() query: ParamsUsersType
  ) {
    const command = new GetUsersByAdminCommand(query);
    return await this.commandBus.execute(command);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":id/ban")
  async updateBanInfo(
    @Param("id") id: string,
    @Body() dto: InfoBanStatusClassModel,
  ) {
    const command = new UpdateBanInfoByAdminCommand(dto, id);
    return await this.commandBus.execute(command);
  }
  @UseGuards(CheckLoginOrEmailGuard)
  @Post()
  async createUser(
    @Ip() ip,
    @Body() dto: CreateUserInputClassModel
  ) {
    const command = new CreateUserByAdminCommand(dto, ip);
    return await this.commandBus.execute(command);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  async deleteUser(
    @Param('id')
      id: string) {
    const command = new DeleteUserByAdminCommand(id);
    return await this.commandBus.execute(command);
  }
  @Delete()
  async deleteAllUser() {
    const command = new DeleteAllUsersByAdminCommand();
    return await this.commandBus.execute(command);
  }
  @Get('banned')
  async GetBannedUser() {
    return await this.usersRepository.getBannedUsers()
  }
}