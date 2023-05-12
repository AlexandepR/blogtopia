import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PaginationType, ParamsType } from "../types/types";
import { pagesCounter, parseQueryPaginator, skipPage } from "../utils/helpers";
import {
  CreatePostInputModelType,
  outputPostModelType,
  PostsTypeFiltered,
  PutPostInputModelType
} from "../posts/type/postsType";
import { BlogsRepository } from "../blogs/blogs.repository";
import { Types } from "mongoose";
import { PostsRepository } from "./posts.repository";


@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository
  ) {
  }

  async findAll(query): Promise<PaginationType<PostsTypeFiltered[]>> {
    // async findAll(query): Promise<any> {
    const { term, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
    const filter = term ? { name: { $regex: term, $options: "i" } } : {};
    const totalCountPosts = await this.postsRepository.getTotalCountPosts(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountPosts, pageSize);
    const posts = await this.postsRepository.getPosts(skip, pageSize, filter, sortBy, sortDirection);
    if (posts) {
      const postsFilterId = posts.map(({
                                         _id,
                                         title,
                                         shortDescription,
                                         content,
                                         blogId,
                                         blogName,
                                         // extendedLikesInfo,
                                         extendedLikesInfo: {
                                           likesCount,
                                           dislikesCount,
                                           likesData,
                                           dislikesData,
                                           myStatus,
                                           newestLikes,
                                           ...restExtendedLikesInfo
                                         },
                                         // __v,
                                         ...rest
                                       }) => {
          let userStatus: "None" | "Like" | "Dislike" = "None";
          // if (userId) {
          //   const userLike = extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
          //   const userDislike = extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
          //   userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
          // }
          return {
            id: _id.toString(),
            title,
            shortDescription,
            content,
            blogId: blogId,
            blogName,
            ...rest,
            extendedLikesInfo: {
              likesCount,
              dislikesCount,
              myStatus: userStatus,
              ...restExtendedLikesInfo,
              newestLikes
            }
          };
        }
      );
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountPosts,
        items: postsFilterId
        // items: posts,
      };
    }
    // return posts
    return null;
  }

  async createPost(dto: CreatePostInputModelType): Promise<outputPostModelType | null> {
    const blogId = new Types.ObjectId(dto.blogId);
    const getBlog = await this.blogsRepository.findBlogById(blogId);
    const createPost = await this.postsRepository.createPost(dto, getBlog);
    return {
      id: createPost._id.toString(),
      title: createPost.title,
      shortDescription: createPost.shortDescription,
      content: createPost.content,
      blogId: createPost.blogId,
      blogName: createPost.blogName,
      createdAt: createPost.createdAt,
      extendedLikesInfo: {
        likesCount: createPost.extendedLikesInfo.likesCount,
        dislikesCount: createPost.extendedLikesInfo.dislikesCount,
        myStatus: createPost.extendedLikesInfo.myStatus,
        newestLikes: createPost.extendedLikesInfo.newestLikes
      }
    };

  }
  async getCommentByPost(id: string, query: ParamsType) {
    const { term, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
    const postId = new Types.ObjectId(id);
    const post = await this.postsRepository.findPostById(postId);
    // const userStatus = await this.postsRepository.findLikesStatus(postId, userId);
    const filter = term ? { name: { $regex: term, $options: "i" } } : {};
    const getTotalCountBlogs = await this.blogsRepository.getTotalCountBlogs(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(getTotalCountBlogs, pageSize);
    const getBlogs = await this.blogsRepository.getBlogs(skip, pageSize, filter, sortBy, sortDirection);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: getTotalCountBlogs,
      items: getBlogs
    };

  }
  async getPost(id: string): Promise<outputPostModelType> {
    const PostId = new Types.ObjectId(id);
    const post = await this.postsRepository.findPostById(PostId);
    if(!post) throw new HttpException('', HttpStatus.NOT_FOUND)
    // const userStatus = await this.postsRepository.findLikesStatus(postId, userId);
    // if (post) {
    //
    //   const sortNewestLikes = post.extendedLikesInfo.likesData.sort((a, b) => {
    //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    //   }).slice(0, 3).map(({ _id, createdAt, userId, userLogin }) => ({
    //     addedAt: createdAt,
    //     userId: userId.toString(),
    //     login: userLogin
    //   }));
    // return post
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: post.extendedLikesInfo.myStatus,
        newestLikes: post.extendedLikesInfo.newestLikes
      }
    };
  }
  async updatePost(id: string, dto: PutPostInputModelType) {
    const postId = new Types.ObjectId(id);
    const post = await this.postsRepository.findPostById(postId);
    if(!post) throw new HttpException('', HttpStatus.NOT_FOUND)
    await post.updatePost(dto);
    return await post.save();
  }
  async deletePost(id: string) {
    const postId = new Types.ObjectId(id);
    const post = await this.postsRepository.findPostById(postId);
    if(!post) throw new HttpException('', HttpStatus.NOT_FOUND)
    if(!postId) throw new HttpException('', HttpStatus.NOT_FOUND)
    return await this.postsRepository.delete(postId);
  }
  async deleteAllPost(): Promise<boolean> {
    return await this.postsRepository.deleteAllPosts();
  }

}