import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { filterBanPostLikesInfo, findLikeStatusForPost, sortNewestLikesForPost } from "../../../../utils/helpers";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { UserDocument } from "../../../users/type/users.schema";
import { outputPostModelType } from "../../type/postsType";
import { UsersRepository } from "../../../users/application/users.repository";
import { PostsRepository } from "../posts.repository";
import { JwtService } from "../../../auth/application/jwt.service";
import { BlogsRepository } from "../../../blogs/application/blogs.repository";
import { getPostByIdFilter } from "../../../../utils/filters/post.filters";

export class GetPostByIdCommand {
  constructor(
    public id: string,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(GetPostByIdCommand)
export class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    protected jwtService: JwtService,
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: GetPostByIdCommand): Promise<outputPostModelType> {
    const postId = new Types.ObjectId(command.id);
    const banUsers: Array<string> = await this.usersRepository.getBannedUsers();
    const getBanBlogs = await this.blogsRepository.getArrayIdBanBlogs()
    const filter = getPostByIdFilter(banUsers, getBanBlogs)
    const post = await this.postsRepository.findPostByIdForBlogger(postId,filter);
    if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
    const filterBanUserLikes = filterBanPostLikesInfo(post,banUsers)
    const userStatus = command.user ? findLikeStatusForPost(filterBanUserLikes, command.user._id) : 'None';
      const sortNewestLikes = sortNewestLikesForPost(post)
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
          myStatus: userStatus,
          newestLikes: sortNewestLikes
        }
      };
    throw new NotFoundException()
  }
}