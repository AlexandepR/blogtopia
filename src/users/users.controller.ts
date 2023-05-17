import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus, Ip,
  Param,
  Post,
  Query, Req,
  ValidationPipe
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserInputClassModel, ParamsUsersType } from "./type/usersTypes";
import { BasicAuth } from "../auth/decorators/public.decorator";
import { checkObjectId } from "../helpers/validation.helpers";


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
  // @UseGuards(BasicAuthGuard)
  // @Get(":id")
  // async getUser(
  //   @Param("id")
  //     id: string
  // ) {
  //   return this.usersService.getUser(id);
  // }
  @BasicAuth()
  @Post()
  @Get(":id")
  async getUserById(
    @Param(ValidationPipe)
    params: checkObjectId
  ) {
    return await this.usersService.findUserById(params.id)
  }
  async createUser(
    @Ip() ip,
    @Body() dto: CreateUserInputClassModel
  ) {
    // dto.email='';
    // const ip = ''
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