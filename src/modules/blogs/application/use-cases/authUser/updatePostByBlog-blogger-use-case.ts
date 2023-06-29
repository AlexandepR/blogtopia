import { BlogsRepository } from "../../../infrastructure/blogs.repository";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreatePostForBlogInputClassModel, CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { Types } from "mongoose";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/infrastructure/posts.repository";
import { UserDocument } from "../../../../users/domain/entities/users.schema";
import { BlogsQueryRepository } from "../../../infrastructure/blogs.query-repository";


export class UpdatePostByBlogCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public dto: CreatePostForBlogInputClassModel,
    public user: UserDocument,
  ) {}
}

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogByBloggerUseCase implements ICommandHandler<UpdatePostByBlogCommand>{
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
  ) {
  }
  async execute(command: UpdatePostByBlogCommand): Promise<any> {
    await validateOrRejectModel(command.dto, CreatePostForBlogInputClassModel);
    if(!Types.ObjectId.isValid(command.blogId) || !Types.ObjectId.isValid(command.postId)) {throw new NotFoundException()}
    const blog = await this.blogsQueryRepository.findBlogById(new Types.ObjectId(command.blogId));
    if(!blog) throw new NotFoundException()
    const post = await this.postsRepository.findPostById(new Types.ObjectId(command.postId));
    if(!post) throw new NotFoundException()
      if(post.postOwnerInfo.userLogin !== command.user.accountData.login ||
        post.postOwnerInfo.userId !== command.user._id.toString()) throw new ForbiddenException()
      await post.updatePost({...command.dto, blogId: command.blogId});
      return await post.save();
  }
}