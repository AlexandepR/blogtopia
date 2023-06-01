// import {
//   Body,
//   Controller,
//   createParamDecorator,
//   Delete, ExecutionContext,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Param,
//   Post,
//   Put,
//   Query,
//   Req, Scope
// } from "@nestjs/common";
// import { BlogsService } from "./blogs.service";
// import { ParamsType } from "../types/types";
// import { BasicAuth, Public, UserFromRequestDecorator } from "../utils/public.decorator";
// import { Request } from "express";
// import { BlogInputClassModel, createPostForBlogInputClassModel } from "./type/blogsType";
// import { UserDocument } from "../users/type/users.schema";
//
//
//
// @Controller({
//   path: "blogs",
// })
// export class BlogsController {
//   constructor(protected blogsService: BlogsService) {
//   }
//   @Public()
//   @Get()
//   async getBlogs(
//     @Query() query: ParamsType,
//   @UserFromRequestDecorator()user:UserDocument,
//   ) {
//     return this.blogsService.findAll(query,user);
//   }
//   @Public()
//   @Get(":id")
//   async getBlog(
//     @Param("id")
//       id: string
//   ) {
//     return await this.blogsService.getBlog(id);
//   }
//   @Public()
//   @Get(":id/posts")
//   async GetPostsByBlog(
//     @Req() req:Request,
//     @Param("id")
//       id: string,
//     @Query() query: ParamsType
//   ) {
//     return await this.blogsService.getPosts(id, query, req);
//   }
//   @Post()
//   async createBlog(
//     @Body() dto: BlogInputClassModel,
//     @UserFromRequestDecorator()user:UserDocument,
//   ) {
//     return await this.blogsService.createBlog(dto,user);
//   }
//   // @BasicAuth()
//   @Post(":id/posts")
//   async createPostForBlog(
//     @Param("id")
//       id: string,
//     @UserFromRequestDecorator()user:UserDocument,
//     @Body() dto: createPostForBlogInputClassModel,
//   ) {
//     return await this.blogsService.createPostForBlog(dto,id,user);
//   }
//   // @BasicAuth()
//   @Put(":id")
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async updateBlog(
//     @Param("id")
//       id: string,
//     @Body() dto: BlogInputClassModel,
//   ) {
//     const purBlog = await this.blogsService.updateBlog(id, dto);
//     if(!purBlog) return (HttpStatus.NOT_FOUND)
//     return purBlog
//   }
//   // @BasicAuth()
//   @Delete(":id")
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async deleteBlog(
//     @Param("id")
//       id: string) {
//     await this.blogsService.deleteBlog(id);
//     return `This blog #${id} removes`;
//   }
//   @BasicAuth()
//   @Delete()
//   async deleteAllBlog() {
//     await this.blogsService.deleteAllBlog();
//   }
//
// }

//
// import {
//   Body,
//   Controller,
//   createParamDecorator,
//   Delete, ExecutionContext,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Param,
//   Post,
//   Put,
//   Query,
//   Req, Scope
// } from "@nestjs/common";
// import { Request } from "express";
// import {
//   BlogInputClassModel,
//   createPostForBlogInputClassModel,
//   updatePostForBlogInputClassModel
// } from "../type/blogsType";
// import { BlogsService } from "../blogs.service";
// import { BasicAuth, Public, UserFromRequestDecorator } from "../../utils/public.decorator";
// import { ParamsType } from "../../types/types";
// import { UserDocument } from "../../users/type/users.schema";
// import { PostsService } from "../../posts/posts.service";
// import { PutPostInputModelType } from "../../posts/type/postsType";
//
//
//
// @Controller({
//   path: "blogger",
//   // scope: Scope.REQUEST
// })
// export class BlogsController {
//   constructor(
//     protected blogsService: BlogsService,
//     protected postsService: PostsService
//   ) {
//   }
//   @Public()
//   @Get()
//   async getBlogs(
//     @Query() query: ParamsType,
//     @UserFromRequestDecorator()user:UserDocument,
//   ) {
//     return this.blogsService.findAll(query,user);
//   }
//   @Public()
//   @Get(":id")
//   async getBlog(
//     @Param("id")
//       id: string
//   ) {
//     return await this.blogsService.getBlog(id);
//   }
//   @Public()
//   @Get(":id/posts")
//   async GetPostsByBlog(
//     @Req() req:Request,
//     @Param("id")
//       id: string,
//     @Query() query: ParamsType
//   ) {
//     return await this.blogsService.getPosts(id, query, req);
//   }
//   @Post()
//   async createBlog(
//     @Body() dto: BlogInputClassModel,
//     @UserFromRequestDecorator()user:UserDocument,
//   ) {
//     return await this.blogsService.createBlog(dto,user);
//   }
//   // @BasicAuth()
//   @Post(":id/posts")
//   async createPostForBlog(
//     @Param("id")
//       id: string,
//     @UserFromRequestDecorator()user:UserDocument,
//     @Body() dto: createPostForBlogInputClassModel,
//   ) {
//     return await this.blogsService.createPostForBlog(dto,id,user);
//   }
//   // @BasicAuth()
//   @Put(":id")
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async updateBlog(
//     @Param("id")
//       id: string,
//     @Body() dto: BlogInputClassModel,
//   ) {
//     const purBlog = await this.blogsService.updateBlog(id, dto);
//     if(!purBlog) return (HttpStatus.NOT_FOUND)
//     return purBlog
//   }
//   async updatePost(
//     @Param("blogId") blogId: string,
//     @Param("postId") postId: string,
//     @Body() body: updatePostForBlogInputClassModel,
//   ) {
//     const UpdatePostDto: PutPostInputModelType = {
//       title: body.title,
//       blogId: blogId,
//       content: body.content,
//       shortDescription: body.shortDescription
//     }
//     const purBlog = await this.postsService.updatePost(postId, {...body, blogId});
//     if(!purBlog) return (HttpStatus.NOT_FOUND)
//     return purBlog
//   }
//   // @BasicAuth()
//   @Delete(":id")
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async deleteBlog(
//     @Param("id")
//       id: string) {
//     await this.blogsService.deleteBlog(id);
//     return `This blog #${id} removes`;
//   }
//   @BasicAuth()
//   @Delete()
//   async deleteAllBlog() {
//     await this.blogsService.deleteAllBlog();
//   }
//
// }