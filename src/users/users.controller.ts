import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserInputModelType, ParamsUsersType } from "./type/usersTypes";


@Controller("users")
export class UsersController {
  constructor(protected usersService: UsersService) {
  }
  @Get()
  async getUsers(
    @Query() query: ParamsUsersType
  ) {
    return this.usersService.findAll(query);
  }
  @Get(":id")
  async getUser(
    @Param("id")
      id: string
  ) {
    return this.usersService.getUser(id);
  }
  @Post()
  async createUser(@Body() dto: CreateUserInputModelType) {
    return await this.usersService.createUser(dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param("id")
      id: string) {
    await this.usersService.deleteUser(id);
    return `This user #${id} removes`;
  }

  @Delete()
  async deleteAllUser() {
    await this.usersService.deleteAllUser();
  }
}