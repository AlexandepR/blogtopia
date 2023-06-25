import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { validateObjectId } from "../../../../utils/helpers";
import { ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { getCommentsByPostOutputModel } from "../../type/postsType";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { PostsRepository } from "../posts.repository";
import { CreateCommentInputClassModel } from "../posts.service";
import { BlogsRepository } from "../../../blogs/infrastructure/blogs.repository";
import { BlogsQueryRepository } from "../../../blogs/infrastructure/blogs.query-repository";


export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public dto: CreateCommentInputClassModel,
    public user: UserDocument,
  ) {
  }
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {
  }
  async execute(command: CreateCommentForPostCommand): Promise<getCommentsByPostOutputModel> {
    await validateOrRejectModel(command.dto, CreateCommentInputClassModel);
    const postId = validateObjectId(command.postId);
    if(!postId) throw new HttpException('', HttpStatus.NOT_FOUND)
    const post = await this.postsRepository.findPostById(postId)
    if(!post) throw new HttpException('', HttpStatus.NOT_FOUND)
    const blog = await this.blogsQueryRepository.findBlogById(post.blogId)
    if(blog.banUsersInfo.find((ban) => ban.login === command.user.accountData.login)) {throw new ForbiddenException()}
    const createComment = await this.postsRepository.createComment(command.dto.content, post, command.user);
    if(!createComment) throw new HttpException('', HttpStatus.NOT_FOUND)
    if (createComment) {
      return {
        id: createComment._id.toString(),
        content: createComment.content,
        commentatorInfo: {
          userId: createComment.commentatorInfo.userId.toString(),
          userLogin: createComment.commentatorInfo.userLogin
        },
        createdAt: createComment.createdAt,
        likesInfo: {
          likesCount: createComment.likesInfo.likesCount,
          dislikesCount: createComment.likesInfo.dislikesCount,
          myStatus: createComment.likesInfo.myStatus,
        }
      };
    }
    else {throw new HttpException('', HttpStatus.BAD_REQUEST)}
  }
}