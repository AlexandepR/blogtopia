import { BlogsRepository } from "../../blogs.repository";
import { NotFoundException } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../posts/type/postsType";
import { Types } from "mongoose";
import { validateOrRejectModel } from "../../../utils/validation.helpers";
import { PostsService } from "../../../posts/posts.service";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";


export class updatePostByBlogCommand {
  constructor(
    public postId: string,
    public UpdatePostDto: CreatePostInputClassModel,
  ) {
  }
}

@CommandHandler(updatePostByBlogCommand)
export class updatePostByBlogUseCase implements ICommandHandler<updatePostByBlogCommand>{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsService: PostsService,
  ) {
  }
  async execute(command: updatePostByBlogCommand): Promise<any> {
    await validateOrRejectModel(command.UpdatePostDto, CreatePostInputClassModel);
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.UpdatePostDto.blogId));
    if (!blog) throw new NotFoundException()
    const dtoForPost = {
      title: command.UpdatePostDto.title,
      shortDescription: command.UpdatePostDto.shortDescription,
      content: command.UpdatePostDto.content,
      blogId: command.UpdatePostDto.blogId
    }
    return await this.postsService.updatePost(command.postId, dtoForPost)
  }
}