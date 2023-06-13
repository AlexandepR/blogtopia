import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../utils/helpers";
import { UserDocument } from "../../../users/type/users.schema";
import { PostsTypeFiltered } from "../../type/postsType";
import { PostsRepository } from "../posts.repository";
import { PaginationType, ParamsType } from "../../../../types/types";
import { JwtService } from "../../../auth/application/jwt.service";
import { UsersRepository } from "../../../users/application/users.repository";
import { BlogsRepository } from "../../../blogs/application/blogs.repository";
import { getPostsPublicFilter } from "../../../../utils/filters/post.filters";


export class GetPostsCommand {
  constructor(
    public query: ParamsType,
    public user: UserDocument
  ) {
  }
}

@CommandHandler(GetPostsCommand)
export class GetPostsUseCase implements ICommandHandler<GetPostsCommand> {
  constructor(
    protected jwtService: JwtService,
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository
  ) {
  }
  async execute(command: GetPostsCommand): Promise<PaginationType<PostsTypeFiltered[]>> {
    const userId = command.user ? command.user._id : "";
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const banBlogs = await this.blogsRepository.getArrayIdBanBlogs();
    const filter = getPostsPublicFilter(banUsers, banBlogs, searchNameTerm)
    const totalCountPosts = await this.postsRepository.getTotalCountPosts(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountPosts, pageSize);
    const posts = await this.postsRepository.getPosts(skip, pageSize, filter, sortBy, sortDirection, banUsers);
    if (posts) {
      const postsFilterId = posts.map(({
                                         _id,
                                         title,
                                         shortDescription,
                                         content,
                                         blogId,
                                         blogName,
                                         extendedLikesInfo,
                                         postOwnerInfo: {
                                           userId: userOwnerId,
                                           userLogin
                                         },
                                         extendedLikesInfo: {
                                           likesCount,
                                           dislikesCount,
                                           likesData,
                                           dislikesData,
                                           myStatus,
                                           newestLikes
                                         },
                                         ...rest
                                       }) => {
          const filteredNewestLikes = newestLikes.map(({ description, ...restNewest }) => restNewest);
          let userStatus: "None" | "Like" | "Dislike" = "None";
          if (userId) {
            const userLike = extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
            const userDislike = extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
            userStatus = userLike ? "Like" : userDislike ? "Dislike" : "None";
          }
          return {
            id: _id.toString(),
            userLogin,
            likesData,
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
              newestLikes: [
                ...filteredNewestLikes
              ]
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
      };
    }
    return null;
  }
}