import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserInputClassModel, ParamsUsersType } from "../type/usersTypes";
import { BasicAuth } from "../../../utils/public.decorator";
import { checkObjectId } from "../../../utils/validation.helpers";
import { CheckLoginOrEmailGuard } from "../../../middleware/middleware";


@Controller("users")
export class UsersController {
  constructor(protected usersService: UsersService) {
  }
  @BasicAuth()
  @Get()
  async getUsers(
    @Query() query: ParamsUsersType
  ) {
    return this.usersService.findAll(query);
  }
  @BasicAuth()
  @Get(":id")
  async getUserById(
    @Param(ValidationPipe)
    params: checkObjectId
  ) {
    return await this.usersService.findUserById(params.id)
  }
  @BasicAuth()
  @Post()
  @UseGuards(CheckLoginOrEmailGuard)
  async createUser(
    @Ip() ip,
    @Body() dto: CreateUserInputClassModel
  ) {
    return await this.usersService.createUser(dto,ip);
  }
  @BasicAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id')
      id: string) {
    return await this.usersService.deleteUser(id);
  }
  @BasicAuth()
  @Delete()
  async deleteAllUser() {
    return await this.usersService.deleteAllUser();
  }
}