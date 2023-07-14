import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectModel } from '../../../../utils/validation.helpers';
import { validateIdByUUID } from '../../../../utils/helpers';
import { ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CommentByPostType } from '../../type/postsType';
import { CreateCommentInputClassModel } from '../posts.service';
import { FindUserType } from '../../../users/type/usersTypes';
import { PostsSqlRepository } from '../../infrastructure/posts.sql-repository';
import { BlogsQuerySqlRepository } from '../../../blogs/infrastructure/blogs.sql.query-repository';
import { CommentsSqlRepository } from '../../../comments/infrastructure/comments.sql-repository';


export class CreateCommentForPostCommand {
    constructor(
        public postId: string,
        public user: FindUserType,
        public dto: CreateCommentInputClassModel,
    ) {
    }
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand> {
    constructor(
        protected postsSqlRepository: PostsSqlRepository,
        protected blogsQuerySqlRepository: BlogsQuerySqlRepository,
        protected commentsSqlRepository: CommentsSqlRepository,
    ) {
    }
    async execute({ dto, postId, user }: CreateCommentForPostCommand): Promise<CommentByPostType> {
        await validateOrRejectModel(dto, CreateCommentInputClassModel);
        if (!validateIdByUUID(postId)) throw new NotFoundException();
        const post = await this.postsSqlRepository.findPostById(postId);
        if (!post) throw new HttpException('', HttpStatus.NOT_FOUND);
        const getBannedUser = await this.blogsQuerySqlRepository.getBanUsersByBlogs(post.blogId)
        if(getBannedUser.find((el) => el.userId === user.ID)) throw new ForbiddenException()
        const comment = await this.postsSqlRepository.createComment(dto.content, postId, user);
        if (!comment) throw new HttpException('', HttpStatus.NOT_FOUND);
        if (comment) {
            return {
                id: comment.ID,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorId,
                    userLogin: comment.commentatorLogin
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesCount,
                    dislikesCount: comment.dislikesCount,
                    myStatus: comment.myStatus,
                }
            };
        } else {
            throw new HttpException('', HttpStatus.BAD_REQUEST);
        }
    }
}