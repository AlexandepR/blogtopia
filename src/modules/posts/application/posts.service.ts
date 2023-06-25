import { Injectable } from "@nestjs/common";
import { BlogsRepository } from "../../blogs/infrastructure/blogs.repository";
import { PostsRepository } from "./posts.repository";
import { Length } from "class-validator";
import { UsersRepository } from "../../users/infrastructure/users.repository";
import { CommentsRepository } from "../../comments/application/comments.repository";
import { JwtService } from "../../auth/application/jwt.service";


export class CreateCommentInputClassModel {
  @Length(20, 300)
  content: string;
}


@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
    protected commentsRepository: CommentsRepository,
    protected jwtService: JwtService
  ) {
  }

  // async findAll(query, req: Request): Promise<PaginationType<PostsTypeFiltered[]>> {
  //   // async findAll(query): Promise<any> {
  //   const userId = await this.jwtService.findUserIdByAuthHeaders(req);
  //   const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
  //   const filter = searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {};
  //   const totalCountPosts = await this.postsRepository.getTotalCountPosts(filter);
  //   const skip = skipPage(pageNumber, pageSize);
  //   const pagesCount = pagesCounter(totalCountPosts, pageSize);
  //   const banUsers = await this.usersRepository.getBannedUsers()
  //   const posts = await this.postsRepository.getPosts(skip, pageSize, filter, sortBy, sortDirection,banUsers);
  //   if (posts) {
  //     const postsFilterId = posts.map(({
  //                                        _id,
  //                                        title,
  //                                        shortDescription,
  //                                        content,
  //                                        blogId,
  //                                        blogName,
  //                                        extendedLikesInfo,
  //                                        extendedLikesInfo: {
  //                                          likesCount,
  //                                          dislikesCount,
  //                                          likesData,
  //                                          dislikesData,
  //                                          myStatus,
  //                                          newestLikes
  //                                        },
  //                                        ...rest
  //                                      }) => {
  //       const filteredNewestLikes = newestLikes.map(({ description, ...restNewest }) => restNewest);
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
  //           blogName,
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
  //       }
  //     );
  //     return {
  //       pagesCount: pagesCount,
  //       page: pageNumber,
  //       pageSize: pageSize,
  //       totalCount: totalCountPosts,
  //       items: postsFilterId
  //       // items: posts,
  //     };
  //   }
  //   // return posts
  //   return null;
  // }
  // async createPost(dto: CreatePostInputClassModel,user: UserDocument): Promise<outputPostModelType | null> {
  //   await validateOrRejectModel(dto, CreatePostInputClassModel);
  //   const blogId = new Types.ObjectId(dto.blogId);
  //   const getBlog = await this.blogsRepository.findBlogById(blogId);
  //   const createPost = await this.postsRepository.createPost(dto, getBlog,user);
  //   return {
  //     id: createPost._id.toString(),
  //     title: createPost.title,
  //     shortDescription: createPost.shortDescription,
  //     content: createPost.content,
  //     blogId: createPost.blogId,
  //     blogName: createPost.blogName,
  //     createdAt: createPost.createdAt,
  //     extendedLikesInfo: {
  //       likesCount: createPost.extendedLikesInfo.likesCount,
  //       dislikesCount: createPost.extendedLikesInfo.dislikesCount,
  //       myStatus: createPost.extendedLikesInfo.myStatus,
  //       newestLikes: createPost.extendedLikesInfo.newestLikes
  //     }
  //   };
  //
  // }
  // async createCommentForPost(id: string, dto: CreateCommentInputClassModel,user: UserDocument): Promise<any> {
  //   await validateOrRejectModel(dto, CreateCommentInputClassModel);
  //   const postId = validateObjectId(id);
  //   if(!postId) throw new HttpException('', HttpStatus.NOT_FOUND)
  //   const findPost = await this.postsRepository.findPostById(postId)
  //   if(!findPost) throw new HttpException('', HttpStatus.NOT_FOUND)
  //   const createComment = await this.postsRepository.createComment(dto.content, postId, user);
  //   if(!createComment) throw new HttpException('', HttpStatus.NOT_FOUND)
  //     if (createComment) {
  //       return {
  //         id: createComment._id.toString(),
  //         content: createComment.content,
  //         commentatorInfo: {
  //           userId: createComment.commentatorInfo.userId.toString(),
  //           userLogin: createComment.commentatorInfo.userLogin
  //         },
  //         createdAt: createComment.createdAt,
  //         likesInfo: {
  //           likesCount: createComment.likesInfo.likesCount,
  //           dislikesCount: createComment.likesInfo.dislikesCount,
  //           myStatus: createComment.likesInfo.myStatus,
  //         }
  //       };
  //     }
  // else {throw new HttpException('', HttpStatus.BAD_REQUEST)}
  // }
  // async getCommentsByPost(id: string, query: ParamsType) {
  //   const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
  //   const postId = new Types.ObjectId(id);
  //   const post = await this.postsRepository.findPostById(postId);
  //   if(!post) throw new HttpException('', HttpStatus.NOT_FOUND)
  //   const totalCount = await this.commentsRepository.getTotalCount(postId);
  //   const skip = skipPage(pageNumber, pageSize);
  //   const pagesCount = pagesCounter(totalCount, pageSize);
  //   const comments = await this.commentsRepository.getComments(
  //     postId,
  //     pageSize,
  //     skip,
  //     sortBy,
  //     sortDirection,
  //   );
  //   if (comments) {
  //     const commentsArray = comments.map((
  //       {
  //         _id, content,
  //         commentatorInfo: { userId, userLogin },
  //         createdAt, likesInfo, __v, ...rest
  //       }) => {
  //       let userStatus: "None" | "Like" | "Dislike" = "None";
  //       if (userId) {
  //         const userLike = likesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
  //         const userDislike = likesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
  //         userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
  //       }
  //       return {
  //         id: _id.toString(),
  //         content: content,
  //         commentatorInfo: {
  //           userId: userId.toString(),
  //           userLogin: userLogin,
  //         },
  //         createdAt: createdAt,
  //         likesInfo: {
  //           likesCount: likesInfo.likesCount,
  //           dislikesCount: likesInfo.dislikesCount,
  //           myStatus: userStatus
  //         }
  //       }});
  //
  //     return {
  //       pagesCount: pagesCount,
  //       page: pageNumber,
  //       pageSize: pageSize,
  //       totalCount: totalCount,
  //       items: commentsArray
  //     };
  //   }
  //   return null;
  // }
  // async getPost(id: string, req: Request): Promise<outputPostModelType> {
  //   const postId = new Types.ObjectId(id);
  //   const post = await this.postsRepository.findPostById(postId);
  //   if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
  //   if (post) {
  //     const userId = await this.jwtService.findUserIdByAuthHeaders(req);
  //     const userStatus = await this.postsRepository.findLikesStatus(postId, userId);
  //     const sortNewestLikes = sortNewestLikesForPost(post)
  //     return {
  //       id: post._id.toString(),
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: post.blogId,
  //       blogName: post.blogName,
  //       createdAt: post.createdAt,
  //       extendedLikesInfo: {
  //         likesCount: post.extendedLikesInfo.likesCount,
  //         dislikesCount: post.extendedLikesInfo.dislikesCount,
  //         myStatus: userStatus,
  //         newestLikes: sortNewestLikes
  //       }
  //     };
  //   }
  //   throw new NotFoundException()
  // }
  // async updatePost(id: string, dto: PutPostInputModelType) {
  //   await validateOrRejectModel(dto, CreatePostInputClassModel);
  //   const postId = new Types.ObjectId(id);
  //   const post = await this.postsRepository.findPostById(postId);
  //   if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
  //   await post.updatePost(dto);
  //   return await post.save();
  // }
  // async updateLikesInfo(dto: likeStatusInputClassModel,id: string, req: Request) {
  //   await validateOrRejectModel(dto, likeStatusInputClassModel);
  //   const userId = await this.jwtService.findUserIdByAuthHeaders(req);
  //   const postId = new Types.ObjectId(id)
  //   const likeStatus = dto.likeStatus
  //   const post = await this.postsRepository.findPostById(postId);
  //   if (!userId || !post) if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
  //   const user =  await this.usersRepository.findUserById(userId)
  //   const {accountData: { login: userLogin }} = user!
  //
  //   const newDate = new Date().toISOString();
  //   const newLikesData: PostLikesType = {
  //     _id: new Types.ObjectId(),
  //     createdAt: newDate,
  //     userId: userId,
  //     userLogin: userLogin,
  //   };
  //   const newestLike: PostsNewestLikesType = {
  //     description: '',
  //     addedAt: newDate,
  //     userId: new Types.ObjectId(userId),
  //     login: userLogin
  //   };
  //   if (likeStatus === 'Like') {
  //     const checkDislikes = await this.postsRepository.checkLikesInfo(postId, userId, 'dislikesData');
  //     if (checkDislikes) {
  //       const post = await this.postsRepository.findPostById(postId);
  //       const updatePostLikesCount = updatePostLikesInfo(post!, likeStatus, newLikesData);
  //       return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
  //     }
  //     await this.postsRepository.checkLikesInfo(postId, userId, 'likesData');
  //     await this.postsRepository.checkNewestLikes(postId, userId);
  //     await this.postsRepository.updateNewestLikes(postId, newestLike);
  //     const getPost = await this.postsRepository.findPostById(postId);
  //     const updatePostLikesCount = updatePostLikesInfo(getPost!, likeStatus, newLikesData);
  //     return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
  //   }
  //   if (likeStatus === 'Dislike') {
  //     const checkLikes = await this.postsRepository.checkLikesInfo(postId, userId, 'likesData');
  //     if (checkLikes) {
  //       await this.postsRepository.checkNewestLikes(postId, userId);
  //       const post = await this.postsRepository.findPostById(postId);
  //       const updatePostLikesCount = updatePostLikesInfo(post!, likeStatus, newLikesData);
  //       return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
  //     }
  //     await this.postsRepository.checkLikesInfo(postId, userId, 'dislikesData');
  //     const getPost = await this.postsRepository.findPostById(postId);
  //     const updatePostLikesCount = updatePostLikesInfo(getPost!, likeStatus, newLikesData);
  //     return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
  //   }
  //   if (likeStatus === 'None') {
  //     await this.postsRepository.checkLikesInfo(postId, userId, 'dislikesData');
  //     await this.postsRepository.checkLikesInfo(postId, userId, 'likesData');
  //     await this.postsRepository.checkNewestLikes(postId, userId);
  //     const post = await this.postsRepository.findPostById(postId);
  //     const updatePostLikesCount = updatePostLikesInfo(post!, likeStatus, newLikesData);
  //     return await this.postsRepository.updatePostLikesInfo(updatePostLikesCount!, postId);
  //   }
  //   return false;
  // }
  // async deletePost(id: string) {
  //   const postId = new Types.ObjectId(id);
  //   const post = await this.postsRepository.findPostById(postId);
  //   if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
  //   return await this.postsRepository.delete(postId);
  // }
  // async deleteAllPost(): Promise<boolean> {
  //   return await this.postsRepository.deleteAllPosts();
  // }

}