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
import { GetUsersByAdminCommand } from "../application/use-cases/getUsers-admin-use-case";
import { CommandBus } from "@nestjs/cqrs";
import {
  UpdateBanInfoByAdminCommand
} from "../application/use-cases/updateUserBanStatus-admin-use-case";
import { CheckLoginOrEmailGuard } from "../../../middleware/middleware";
import { CreateUserByAdminCommand } from "../application/use-cases/createUser-admin-use-case";
import { checkObjectId } from "../../../utils/validation.helpers";
import { DeleteUserByAdminCommand } from "../application/use-cases/deleteUser-admin-use-case";
import { DeleteAllUsersByAdminCommand } from "../application/use-cases/deleteAllUsers-admin-use-case";
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
  @Put(":userId/ban")
  async updateBanInfo(
    @Param("userId") userId: string,
    @Body() dto: InfoBanStatusClassModel,
  ) {
    const command = new UpdateBanInfoByAdminCommand(dto, userId);
    return await this.commandBus.execute(command);
  }
  @Post()
  @UseGuards(CheckLoginOrEmailGuard)
  async createUser(
    @Ip() ip,
    @Body() dto: CreateUserInputClassModel
  ) {
    const command = new CreateUserByAdminCommand(dto, ip);
    return await this.commandBus.execute(command);
  }
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param(ValidationPipe)
      params: checkObjectId) {
    const command = new DeleteUserByAdminCommand(params.id);
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