import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "../../blogs.repository";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/application/posts.repository";
import { UserDocument } from "../../../../users/type/users.schema";

export class DeletePostByBlogCommand {
  constructor(
      public blogId: string,
      public postId: string,
      public user: UserDocument,
  ){}
}

@CommandHandler(DeletePostByBlogCommand)
export class DeletePostByBlogByBloggerUseCase implements ICommandHandler<DeletePostByBlogCommand>{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
  }
  async execute(command: DeletePostByBlogCommand): Promise<boolean> {
    if(!Types.ObjectId.isValid(command.blogId) || !Types.ObjectId.isValid(command.postId)) {throw new NotFoundException()}
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.blogId));
    if (!blog) throw new NotFoundException()
    const post = await this.postsRepository.findPostById(new Types.ObjectId(command.postId));
    if (!post) throw new NotFoundException()
    if(post.postOwnerInfo.userLogin !== command.user.accountData.login ||
      post.postOwnerInfo.userId !== command.user._id.toString()) throw new ForbiddenException()
    // if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login ||
    //   blog.blogOwnerInfo.userId !== command.user._id.toString()) throw new ForbiddenException()
    return await this.postsRepository.delete(new Types.ObjectId(command.postId));
  }
}