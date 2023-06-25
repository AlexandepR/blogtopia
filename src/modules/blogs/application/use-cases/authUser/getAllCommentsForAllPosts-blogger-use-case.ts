import { ParamsPaginationType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { pagesCounter, parseQueryPaginator, skipPage, validateObjectId } from "../../../../../utils/helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../../../comments/application/comments.repository";
import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { PostsRepository } from "../../../../posts/application/posts.repository";


export class GetAllCommentsForBloggerCommand {
  constructor(
    public query: ParamsPaginationType,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetAllCommentsForBloggerCommand)
export class GetAllCommentsForBloggerUseCase implements ICommandHandler<GetAllCommentsForBloggerCommand>{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
    ) {
  }
  async execute(command: GetAllCommentsForBloggerCommand): Promise<any> {
    const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const userId = validateObjectId(command.user._id.toString())
    const allOwnPostId = await this.postsRepository.getArrayIdOwnPosts(userId)
    const totalComments = await this.commentsRepository.getTotalCommentsForBlog(allOwnPostId)
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalComments, pageSize);
    const findAllComments = await this.commentsRepository.getTotalCommentsForBlogs(skip, pageSize, sortBy, sortDirection,allOwnPostId)
    return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalComments,
        items: findAllComments
    }
  }
}