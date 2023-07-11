import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { pagesCounter, parseQueryPaginator, skipPage } from '../../../../utils/helpers';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PaginationType, ParamsType } from '../../../../types/types';
import { CommentsSqlRepository } from '../../../comments/infrastructure/comments.sql-repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { CommentDataType } from '../../../comments/type/commentsType';


export class GetCommentsByPostCommand {
    constructor(
        public query: ParamsType,
        public postId: string,
    ) {
    }
}

@CommandHandler(GetCommentsByPostCommand)
export class GetCommentsByPostUseCase implements ICommandHandler<GetCommentsByPostCommand> {
    constructor(
        protected commentsSqlRepository: CommentsSqlRepository,
        protected postsSqlRepository: PostsSqlRepository,
    ) {
    }
    async execute({ postId, query }: GetCommentsByPostCommand): Promise<PaginationType<CommentDataType[]>> {
        const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
        const post = await this.postsSqlRepository.findPostById(postId);
        if (!post) throw new HttpException('', HttpStatus.NOT_FOUND);
        const totalCount = await this.commentsSqlRepository.getTotalCount(postId);
        const skip = skipPage(pageNumber, pageSize);
        const pagesCount = pagesCounter(totalCount, pageSize);
        const comments = await this.commentsSqlRepository.getComments(postId, pageSize, skip, sortBy, sortDirection,);
        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: comments
        };
    }
}