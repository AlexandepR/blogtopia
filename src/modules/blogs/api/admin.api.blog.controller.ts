import { Controller, Get, HttpCode, HttpStatus, Param, Put, Query } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { getBlogsByAdminCommand } from "../application/use-cases/admin/getBlogs-blogs-admin-use-case";
import { BindUserToBlogCommand } from "../application/use-cases/admin/bindUserToBlog-blogs-admin-use-case";
import { BasicAuth } from "../../../utils/public.decorator";
import { ParamsType } from "../../../types/types";


@BasicAuth()
@Controller({
  path: "sa/blogs",
  // scope: Scope.REQUEST
})
export class BlogsController {
  constructor(
    protected commandBus: CommandBus,
  ) {
  }
  @Get()
  async getBlogs(
    @Query() query: ParamsType,
  ) {
    const command = new getBlogsByAdminCommand(query)
    return this.commandBus.execute(command)
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":blogId/bind-with-user/:userId")
  async bindUserToBlog(
    @Param("blogId") blogId: string,
    @Param("userId") userId: string,
  ) {
    const command = new BindUserToBlogCommand(blogId, userId)
    return this.commandBus.execute(command)
    // return await this.blogsService.getBlog(id);
  }

  // @Delete(":id")
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteUser(
  //   @Param("id")
  //     id: string,
  //   @Body() dto: BlogInputClassModel,
  // ) {
  //   const purBlog = await this.blogsService.updateBlog(id, dto);
  //   if(!purBlog) return (HttpStatus.NOT_FOUND)
  //   return purBlog
  // }
  //
  // @BasicAuth()
  // @Get(":id")
  // async getUserById(
  //   @Param(ValidationPipe)
  //     params: checkObjectId
  // ) {
  //   return await this.usersService.findUserById(params.id)
  // }
}