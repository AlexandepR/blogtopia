import { NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "../../blogs.repository";
import { Types } from "mongoose";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/application/posts.repository";

export class DeletePostByBlogCommand {
  constructor(
      public blogId: string,
      public postId: string
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
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.blogId));
    const post = await this.postsRepository.findPostById(new Types.ObjectId(command.postId));
    if (!blog && !post) throw new NotFoundException()
    return await this.postsRepository.delete(new Types.ObjectId(command.postId));
  }
}