import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaginationType, ParamsType } from '../../../../../types/types';
import { PostsTypeFiltered } from '../../../../posts/type/postsType';
import { pagesCounter, parseQueryPaginator, skipPage, validateIdByUUID } from '../../../../../utils/helpers';
import { NotFoundException } from '@nestjs/common';
import { PostsSqlRepository } from '../../../../posts/infrastructure/posts.sql-repository';
import { UsersSqlRepository } from '../../../../users/infrastructure/users.sql-repository';
import { BlogsQuerySqlRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { FindUserType } from '../../../../users/type/usersTypes';


export class GetPostsByBlogBloggerCommand {
    constructor(
        public blogId: string,
        public query: ParamsType,
        public user: FindUserType
    ) {}
}

@CommandHandler(GetPostsByBlogBloggerCommand)
export class GetPostsByBlogBloggerUseCase implements ICommandHandler<GetPostsByBlogBloggerCommand>{
    constructor(
                protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
                protected postsSqlRepository: PostsSqlRepository,
                protected usersSqlRepository: UsersSqlRepository,
    ) {
    }
    async execute(command: GetPostsByBlogBloggerCommand): Promise<PaginationType<PostsTypeFiltered[]>> {
        const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(command.query);
        if(!validateIdByUUID(command.blogId)) {throw new NotFoundException()}
        const blogId = command.blogId;
        const blog = await this.blogsQuerySqlRepository.findBlogById(blogId);
        if (!blog) throw new NotFoundException()
        const totalCountPosts = await this.postsSqlRepository.getTotalCountPosts(blogId);
        const skip = skipPage(pageNumber, pageSize);
        const pagesCount = pagesCounter(totalCountPosts, pageSize);
        const posts = await this.postsSqlRepository.getPosts(skip, pageSize, sortBy, sortDirection,blogId,command.user);
            return {
                pagesCount: pagesCount,
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCountPosts,
                items: posts
            };
    }
}