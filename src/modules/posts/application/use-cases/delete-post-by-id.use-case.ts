import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { PostsRepository } from "../posts.repository";


export class DeletePostByIdCommand {
  constructor(
    public id: string,
  ) {
  }
}

@CommandHandler(DeletePostByIdCommand)
export class UpdatePostUseCase implements ICommandHandler<DeletePostByIdCommand> {
  constructor(
    protected postsRepository: PostsRepository,
  ) {
  }
  async execute(command: DeletePostByIdCommand): Promise<boolean> {
    const postId = new Types.ObjectId(command.id);
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
    return await this.postsRepository.delete(postId);
  }
}