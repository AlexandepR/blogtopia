import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../posts.repository";


export class DeleteAllPostsCommand {
  constructor(
  ) {
  }
}

@CommandHandler(DeleteAllPostsCommand)
export class DeleteAllPostsUseCase implements ICommandHandler<DeleteAllPostsCommand> {
  constructor(
    protected postsRepository: PostsRepository,
  ) {
  }
  async execute(command: DeleteAllPostsCommand): Promise<boolean> {
    return await this.postsRepository.deleteAllPosts();
  }
}