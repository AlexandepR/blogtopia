import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { BlogsRepository } from "./blogs.repository";
import { BlogType, CreateBlogInputModelType, createPostForBlogInputModel, PutBlogDtoType } from "./type/blogsType";
import { PaginationType, ParamsType } from "../types/types";
import { BlogDocument } from "./type/blogs.schema";
import { pagesCounter, parseQueryPaginator, skipPage } from "../utils/helpers";
import { Types } from "mongoose";
import { outputPostModelType, PostsTypeFiltered } from "../posts/type/postsType";
import { PostsRepository } from "../posts/posts.repository";


@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository
  ) {
  }

  async findAll(query): Promise<PaginationType<BlogDocument[]>> {
    const { term, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
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
  async createBlog(dto: CreateBlogInputModelType): Promise<BlogType> {
    const createBlog = await this.blogsRepository.create(dto);
    if(!createBlog) throw new HttpException('', HttpStatus.NOT_FOUND)
    return {
      id: createBlog._id.toString(),
      name: createBlog.name,
      description: createBlog.description,
      websiteUrl: createBlog.websiteUrl,
      createdAt: createBlog.createdAt,
      isMembership: createBlog.isMembership
    };
  }
  async createPostForBlog(postDto: createPostForBlogInputModel, id: string): Promise<outputPostModelType | null> {
    // idParamsValidator(req.params.blogId, res);
    const blogId = new Types.ObjectId(id);
    const getBlog = await this.blogsRepository.findBlogById(blogId);
    if (!getBlog) throw new HttpException("", HttpStatus.NOT_FOUND);
    const createPost = await this.blogsRepository.createPost(postDto, getBlog);
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
    // const { title, shortDescription, content } = dto;
    // const newPostForBlog = await this.blogsService.createPostForBlog(
    //   blogId, title, shortDescription, content);
  }
  async getBlog(id: string) {
    // if(!blog) throw new BadRequestException(HttpStatus.NOT_FOUND)
      const blogId = new Types.ObjectId(id);
      const blog = await this.blogsRepository.findBlogById(blogId);
      if (!blog) throw new HttpException("", HttpStatus.NOT_FOUND);
      return {
        id: blog._id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership
      };
  }
  async getPosts(id: string, query: ParamsType): Promise<PaginationType<PostsTypeFiltered[]>> {
    const { term, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
    const filter = term ? { name: { $regex: term, $options: "i" } } : {};
    const totalCountPosts = await this.postsRepository.getTotalCountPosts(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountPosts, pageSize);
    const blogId = new Types.ObjectId(id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    if(!blog) throw new HttpException('', HttpStatus.NOT_FOUND)
    const posts = await this.postsRepository.getPosts(skip, pageSize, filter, sortBy, sortDirection);
    // if(!posts || posts.length <= 0) throw new HttpException('', HttpStatus.NOT_FOUND)
    if (posts) {
      const postsArray = posts.map(({
                                      _id,
                                      title,
                                      shortDescription,
                                      content,
                                      blogId,
                                      extendedLikesInfo,
                                      extendedLikesInfo: {
                                        likesCount,
                                        dislikesCount,
                                        likesData,
                                        dislikesData,
                                        myStatus,
                                        newestLikes,
                                        ...restExtendedLikesInfo
                                      },
                                      __v,
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
          ...rest,
          extendedLikesInfo: {
            likesCount,
            dislikesCount,
            myStatus: userStatus,
            ...restExtendedLikesInfo,
            newestLikes
          }
        };
      });
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountPosts,
        items: postsArray
      };
    }
    return null;
  }

  async updateBlog(id: string, dto: PutBlogDtoType) {
    const blogId = new Types.ObjectId(id);
    const blog = await this.blogsRepository.findBlogById(blogId);
    blog.updateBlog(dto);
    return await this.blogsRepository.save(blog);
  }
  async deleteBlog(id: string) {
    const blogId = new Types.ObjectId(id);
    return await this.blogsRepository.delete(blogId);
  }
  async deleteAllBlog(): Promise<boolean> {
    return await this.blogsRepository.deleteAllBlogs();
  }
}