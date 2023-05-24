import { Body, Controller, Delete, Get, Param, Put, Query, Req } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { ParamsType } from "../types/types";
import { Request } from 'express';
import { likeStatusInputClassModel } from "../posts/type/postsType";
import { Public, UserFromRequestDecorator } from "../utils/public.decorator";
import { UserDocument } from "../users/type/users.schema";
import { commentContentInputClassModel } from "./type/commentsType";

@Controller("comments")
export class CommentsController {
  constructor(protected commentsService: CommentsService) {

  }
  @Public()
  @Get(":id")
  async getComment(
    @Req() req: Request,
    @Param("id")
      id: string
  ) {
    return await this.commentsService.getComment(id, req);
  }
  @Put(":id")
  async updateComment(
    @Param("id")
      id: string,
    @UserFromRequestDecorator() user: UserDocument,
    @Body() dto: commentContentInputClassModel
  ) {
    return await this.commentsService.updateComment(id, dto, user);
  }
  @Put(':id/like-status')
  async updateLikeByCommentId(
    @Body() dto: likeStatusInputClassModel,
    @Req() req:Request,
    @Param('id') id: string,
  ) {
    return await this.commentsService.updateLikeByCommentId(dto, id, req);
  }
  @Delete(":id")
  async deleteBlog(
    @Param("id") id: string,
    @Req() req:Request,
  )
  {
    await this.commentsService.deleteCommentById(id, req);
    return `This blog #${id} removes`;
  }
  @Delete('')
  async deleteAllBlog() {
   return await this.commentsService.deleteAllComment();
  }
}