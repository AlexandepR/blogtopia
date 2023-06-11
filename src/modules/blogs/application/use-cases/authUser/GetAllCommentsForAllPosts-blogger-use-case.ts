import { ParamsPaginationType } from "../../../../../types/types";
import { UserDocument } from "../../../../users/type/users.schema";
import { pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../../../comments/application/comments.repository";


export class GetAllCommentsForAllPostsCommand {
  constructor(
    public query: ParamsPaginationType,
    public user: UserDocument,
  ) {}
}

@CommandHandler(GetAllCommentsForAllPostsCommand)
export class GetAllCommentsForAllPostsCommandUseCase implements ICommandHandler<GetAllCommentsForAllPostsCommand>{
  constructor(
    protected commentsRepository: CommentsRepository,
    ) {
  }
  async execute(command: GetAllCommentsForAllPostsCommand): Promise<any> {
    const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
    const userId = command.user._id
    const totalComments = await this.commentsRepository.getTotalOwnComments(userId)
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalComments, pageSize);
    const findAllComments = await this.commentsRepository.findAllOwnComments(skip, pageSize, sortBy, sortDirection,userId)
    return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalComments,
        items: findAllComments
    }
  }
}