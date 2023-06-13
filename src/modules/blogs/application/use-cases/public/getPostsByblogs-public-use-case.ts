import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BlogsRepository } from "../../blogs.repository";
import { PostsRepository } from "../../../../posts/application/posts.repository";
import { PaginationType, ParamsType } from "../../../../../types/types";
import { PostsTypeFiltered } from "../../../../posts/type/postsType";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../../../../users/application/users.repository";
import { getPostsByBlogFilter } from "../../../../../utils/filters/post.filters";


export class GetPostsByBlogCommand {
  constructor(
    public id: string,
    public query: ParamsType,
  ) {}
}

@CommandHandler(GetPostsByBlogCommand)
export class GetPostsByBlogUseCase implements ICommandHandler<GetPostsByBlogCommand>{
  constructor(protected blogsRepository: BlogsRepository,
              protected postsRepository: PostsRepository,
              protected usersRepository: UsersRepository,
              ) {
  }
  async execute(command: GetPostsByBlogCommand): Promise<PaginationType<PostsTypeFiltered[]>> {
    const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const blogId = new Types.ObjectId(command.id);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers()
    const getBanBlogs = await this.blogsRepository.getArrayIdBanBlogs()
    const filter = getPostsByBlogFilter(getBanBlogs, banUsers)
    const blog = await this.blogsRepository.findBlogByIdForBlogger(blogId,filter);;
    if (!blog) throw new NotFoundException()
    const totalCountPosts = await this.postsRepository.getTotalCountPosts(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountPosts, pageSize);
    const posts = await this.postsRepository.getPosts(skip, pageSize, filter, sortBy, sortDirection,banUsers);
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
                                        newestLikes
                                      },
                                      __v,
                                      ...rest

                                    }) => {
        const filteredNewestLikes = newestLikes.map(({ description, ...restNewest }) => restNewest);
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
            newestLikes: [
              ...filteredNewestLikes
            ]
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
}