// import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
// import { BlogsRepository } from "./blogs.repository";
// import {
//   BlogInputClassModel,
//   BlogType,
//   createPostForBlogInputClassModel,
//   updatePostForBlogInputModel
// } from "./type/blogsType";
// import { PaginationType, ParamsType } from "../types/types";
// import { BlogDocument } from "./type/blogs.schema";
// import { filterByNameTermOrUserLogin, pagesCounter, parseQueryPaginator, skipPage } from "../utils/helpers";
// import { Types } from "mongoose";
// import {
//   CreatePostInputClassModel,
//   outputPostModelType,
//   PostsTypeFiltered,
//   PutPostInputModelType
// } from "../posts/type/postsType";
// import { PostsRepository } from "../posts/posts.repository";
// import { validateOrRejectModel } from "../utils/validation.helpers";
// import { JwtService } from "../auth/jwt.service";
// import { Request } from "express";
// import { UserDocument } from "../users/type/users.schema";
// import { PostsService } from "../posts/posts.service";
//
//
// @Injectable()
// export class BlogsService {
//   constructor(
//     protected blogsRepository: BlogsRepository,
//     protected postsRepository: PostsRepository,
//     protected postsService: PostsService,
//     protected jwtService: JwtService,
//   ) {
//   }
//   async findAll(query: ParamsType, user: UserDocument): Promise<PaginationType<BlogDocument[]>> {
//     const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
//     const filter = filterByNameTermOrUserLogin(searchNameTerm,user.accountData.login)
//     const getTotalCountBlogs = await this.blogsRepository.getTotalCountBlogs(filter);
//     const skip = skipPage(pageNumber, pageSize);
//     const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
//     const getBlogs = await this.blogsRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection);
//     return {
//       pagesCount: pagesCount,
//       page: pageNumber,
//       pageSize: pageSize,
//       totalCount: getTotalCountBlogs,
//       items: getBlogs
//     };
//   }
//   async createBlog(dto: BlogInputClassModel, user: UserDocument): Promise<BlogType> {
//     await validateOrRejectModel(dto, BlogInputClassModel);
//     const createBlog = await this.blogsRepository.createBlog(dto,user);
//     if (!createBlog) throw new HttpException("", HttpStatus.NOT_FOUND);
//     return {
//       id: createBlog._id.toString(),
//       name: createBlog.name,
//       description: createBlog.description,
//       websiteUrl: createBlog.websiteUrl,
//       createdAt: createBlog.createdAt,
//       isMembership: createBlog.isMembership
//     };
//   }
//   async createPostForBlog(postDto: createPostForBlogInputClassModel, id: string,user: UserDocument): Promise<outputPostModelType | null> {
//     await validateOrRejectModel(postDto, createPostForBlogInputClassModel);
//     const blogId = new Types.ObjectId(id);
//     const getBlog = await this.blogsRepository.findBlogById(blogId);
//     if (!getBlog) throw new HttpException("", HttpStatus.NOT_FOUND);
//     const createPost = await this.blogsRepository.createPost(postDto, getBlog,user);
//     return {
//       id: createPost._id.toString(),
//       title: createPost.title,
//       shortDescription: createPost.shortDescription,
//       content: createPost.content,
//       blogId: createPost.blogId,
//       blogName: createPost.blogName,
//       createdAt: createPost.createdAt,
//       extendedLikesInfo: {
//         likesCount: createPost.extendedLikesInfo.likesCount,
//         dislikesCount: createPost.extendedLikesInfo.dislikesCount,
//         myStatus: createPost.extendedLikesInfo.myStatus,
//         newestLikes: createPost.extendedLikesInfo.newestLikes
//       }
//     };
//   }
//   async getBlog(id: string) {
//     const blogId = new Types.ObjectId(id);
//     const blog = await this.blogsRepository.findBlogById(blogId);
//     if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
//     return {
//       id: blog._id,
//       name: blog.name,
//       description: blog.description,
//       websiteUrl: blog.websiteUrl,
//       createdAt: blog.createdAt,
//       isMembership: blog.isMembership
//     };
//   }
//   async getPosts(id: string, query: ParamsType,req:Request): Promise<PaginationType<PostsTypeFiltered[]>> {
//     const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
//     const blogId = new Types.ObjectId(id);
//     const userId = await this.jwtService.findUserIdByAuthHeaders(req);
//     const blog = await this.blogsRepository.findBlogById(blogId);
//     if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
//     const filter = { blogId: new Types.ObjectId(id) };
//     const totalCountPosts = await this.postsRepository.getTotalCountPosts(filter);
//     const skip = skipPage(pageNumber, pageSize);
//     const pagesCount = pagesCounter(totalCountPosts, pageSize);
//     const posts = await this.postsRepository.getPosts(skip, pageSize, filter, sortBy, sortDirection);
//     if (posts) {
//       const postsArray = posts.map(({
//                                       _id,
//                                       title,
//                                       shortDescription,
//                                       content,
//                                       blogId,
//                                       extendedLikesInfo,
//                                       extendedLikesInfo: {
//                                         likesCount,
//                                         dislikesCount,
//                                         likesData,
//                                         dislikesData,
//                                         myStatus,
//                                         newestLikes
//                                       },
//                                       __v,
//                                       ...rest
//
//                                     }) => {
//         const filteredNewestLikes = newestLikes.map(({ description, ...restNewest }) => restNewest);
//         let userStatus: "None" | "Like" | "Dislike" = "None";
//         if (userId) {
//           const userLike = extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
//           const userDislike = extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
//           userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
//         }
//         return {
//           id: _id.toString(),
//           title,
//           shortDescription,
//           content,
//           blogId: blogId,
//           ...rest,
//           extendedLikesInfo: {
//             likesCount,
//             dislikesCount,
//             myStatus: userStatus,
//             newestLikes: [
//               ...filteredNewestLikes
//             ]
//           }
//         };
//       });
//       return {
//         pagesCount: pagesCount,
//         page: pageNumber,
//         pageSize: pageSize,
//         totalCount: totalCountPosts,
//         items: postsArray
//       };
//     }
//     return null;
//   }
//   async updateBlog(id: string, dto: BlogInputClassModel): Promise<BlogDocument> {
//     await validateOrRejectModel(dto, BlogInputClassModel);
//     const blogId = new Types.ObjectId(id);
//     const blog = await this.blogsRepository.findBlogById(blogId);
//     if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
//     blog.updateBlog(dto);
//     return await this.blogsRepository.save(blog);
//   }
//   async updatePost(blogId: string, postId: string, dto: updatePostForBlogInputModel) {
//     await validateOrRejectModel(dto, CreatePostInputClassModel);
//     const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(blogId));
//     if (!blog) throw new NotFoundException()
//     const dtoForPost = {title: dto.title,
//       shortDescription: dto.shortDescription,
//       content: dto.content,
//       blogId: blogId
//     }
//     return await this.postsService.updatePost(postId,dtoForPost)
//   }
//   async deleteBlog(id: string) {
//     const blogId = new Types.ObjectId(id);
//     const blog = await this.blogsRepository.findBlogById(blogId);
//     if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
//     return await this.blogsRepository.delete(blogId);
//   }
//   async deleteAllBlog(): Promise<boolean> {
//     return await this.blogsRepository.deleteAllBlogs();
//   }
// }