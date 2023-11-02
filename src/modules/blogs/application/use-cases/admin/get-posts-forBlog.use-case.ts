import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PaginationType, ParamsType } from "../../../../../types/types";
import { PostsTypeFiltered } from "../../../../posts/type/postsType";
import { pagesCounter, parseQueryPaginator, skipPage, validateIdByUUID } from "../../../../../utils/helpers";
import { NotFoundException } from "@nestjs/common";
import { BlogsOrmQueryRepository } from "../../../infrastructure/blogs.orm.query-repository";
import { PostsOrmRepository } from "../../../../posts/infrastructure/posts.orm-repository";


export class GetPostsForBlogByAdminCommand {
    constructor(
        public blogId: string,
        public query: ParamsType,
    ) {}
}

@CommandHandler(GetPostsForBlogByAdminCommand)
export class GetPostsForBlogByAdminUseCase implements ICommandHandler<GetPostsForBlogByAdminCommand>{
    constructor(
                protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
                protected postsOrmRepository: PostsOrmRepository,
    ) {
    }
    async execute({query, blogId}: GetPostsForBlogByAdminCommand): Promise<PaginationType<PostsTypeFiltered[]>> {
        const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
        if(!validateIdByUUID(blogId)) throw new NotFoundException()
        const blog = await this.blogsOrmQueryRepository.findBlogById(blogId);
        if (!blog) throw new NotFoundException()
        const totalCountPosts = await this.postsOrmRepository.getTotalCountPostsByBlog(blogId);
        const skip = skipPage(pageNumber, pageSize);
        const pagesCount = pagesCounter(totalCountPosts, pageSize);
        const posts = await this.postsOrmRepository.getPostsByBlogs(skip, pageSize, sortBy, sortDirection,blogId);
        return {
                pagesCount: pagesCount,
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCountPosts,
                items: posts
            };
    }
}