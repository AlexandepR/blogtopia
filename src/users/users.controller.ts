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
  Query, UseGuards,
  UseInterceptors,
  ValidationPipe
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserInputClassModel, ParamsUsersType } from "./type/usersTypes";
import { BasicAuth } from "../auth/decorators/public.decorator";
import { checkObjectId } from "../helpers/validation.helpers";
import { CheckLoginOrEmailGuard } from "../middleware/middleware";


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
    @Param(ValidationPipe)
      params: checkObjectId) {
    await this.usersService.deleteUser(params.id);
    return `This user #${params.id} removes`;
  }
  @BasicAuth()
  @Delete()
  async deleteAllUser() {
    await this.usersService.deleteAllUser();
  }
}