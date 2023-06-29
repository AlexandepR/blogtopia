import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { HttpException, HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { CreatePostInputClassModel } from "../../type/postsType";
import { PostsRepository } from "../../infrastructure/posts.repository";
import { PostDocument } from "../../domain/entities/posts.schema";


export class UpdatePostCommand {
  constructor(
    public dto: CreatePostInputClassModel,
    public id: string,
  ) {
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
  ) {
  }
  async execute(command: UpdatePostCommand): Promise<PostDocument> {
    await validateOrRejectModel(command.dto, CreatePostInputClassModel);
    const postId = new Types.ObjectId(command.id);
    const post = await this.postsRepository.findPostById(postId);
    if (!post) throw new HttpException("", HttpStatus.NOT_FOUND);
    await post.updatePost(command.dto);
    return await post.save();
  }
}