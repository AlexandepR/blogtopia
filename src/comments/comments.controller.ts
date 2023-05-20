import { Body, Controller, Delete, Get, Param, Put, Query, Req } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { ParamsType } from "../types/types";
import { Request } from 'express';
import { likeStatusType } from "../posts/type/postsType";

@Controller("comments")
export class CommentsController {
  constructor(protected commentsService: CommentsService) {

  }
  @Get(":id")
  async getComment(
    @Req() req: Request,
    @Param("id")
      id: string
  ) {
    return await this.commentsService.getComment(id, req);
  }
  @Put(":id")
  async GetPostsByBlog(
    @Param("id")
      id: string,
    @Req() req: Request,
    @Body() content: string
  ) {
    return await this.commentsService.updateComment(id, content,req);
  }
  @Put(':id/like-status')
  async createBlog(
    @Body() dto: likeStatusType,
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