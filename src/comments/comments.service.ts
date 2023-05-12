import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { PaginationType } from "../types/types";
import { pagesCounter, parseQueryPaginator, skipPage } from "../utils/helpers";
import { UsersRepository } from "../users/users.repository";
import { CommentType } from "./type/commentsType";


@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: UsersRepository,
  ) {}

  async findAll(query): Promise<PaginationType<Omit<CommentType, 'postId' | 'likesInfo'>[]> | null> {
    const { term, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
    const filter = term ? { name: { $regex: term, $options: "i" } } : {};
    const totalCountComments = await this.commentsRepository.getTotalCountComments(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountComments, pageSize);
    const comments = await this.commentsRepository.getComments(pageSize, skip, filter, sortBy, sortDirection);
    if (comments) {
      const commentsArray = comments.map((
        {
          _id, content,
          commentatorInfo: { userId, userLogin },
          createdAt, likesInfo, __v, ...rest
        }) => (
        {
          id: _id.toString(),
          content: content,
          commentatorInfo: {
            userId: userId.toString(),
            userLogin: userLogin,
          },
          createdAt: createdAt,
          likesInfo: {
            likesCount: likesInfo.likesCount,
            dislikesCount: likesInfo.dislikesCount,
            myStatus: likesInfo.myStatus
          }
        }));
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountComments,
        items: commentsArray
      };
    }
    return null;
  }
}










  // async deleteBlog(id: string) {
  //   const blogId = new Types.ObjectId(id)
  //   return await this.blogsRepository.delete(blogId)
  // }
  // async deleteAllBlog(): Promise<boolean> {
  //   return await this.blogsRepository.deleteAllBlogs();
  // }