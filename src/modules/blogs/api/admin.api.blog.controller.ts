import { Body, Controller, Get, HttpCode, HttpStatus, Param, Put, Query } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { getBlogsByAdminCommand } from "../application/use-cases/admin/get-blogs.use-case";
import { BindUserToBlogCommand } from "../application/use-cases/admin/bind-user-to-blog.use-case";
import { BasicAuth } from "../../../utils/public.decorator";
import { ParamsType } from "../../../types/types";
import { BanInfoBlogInputClassModel } from "../type/blogsType";
import { UpdateBanInfoBlogCommand } from "../application/use-cases/admin/update-ban-info.use-case";


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
  @Put(":blogId/ban")
  async updateBanInfoForBlog(
    @Param("blogId") blogId: string,
    @Body() dto: BanInfoBlogInputClassModel
  ) {
    const command = new UpdateBanInfoBlogCommand(dto, blogId)
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