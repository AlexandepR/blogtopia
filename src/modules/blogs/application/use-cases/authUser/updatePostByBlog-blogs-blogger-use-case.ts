import { BlogsRepository } from "../../blogs.repository";
import { NotFoundException } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { Types } from "mongoose";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/application/posts.repository";


export class UpdatePostByBlogCommand {
  constructor(
    public postId: string,
    public UpdatePostDto: CreatePostInputClassModel,
  ) {}
}

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogByBloggerUseCase implements ICommandHandler<UpdatePostByBlogCommand>{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {
  }
  async execute(command: UpdatePostByBlogCommand): Promise<any> {
    await validateOrRejectModel(command.UpdatePostDto, CreatePostInputClassModel);
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.UpdatePostDto.blogId));
    const post = await this.postsRepository.findPostById(new Types.ObjectId(command.postId));
    if (!blog && !post) throw new NotFoundException()
    // const dtoForPost = {
    //   title: command.UpdatePostDto.title,
    //   shortDescription: command.UpdatePostDto.shortDescription,
    //   content: command.UpdatePostDto.content,
    //   blogId: command.UpdatePostDto.blogId
    // }
    await post.updatePost(command.UpdatePostDto);
    return await post.save();
  }
}