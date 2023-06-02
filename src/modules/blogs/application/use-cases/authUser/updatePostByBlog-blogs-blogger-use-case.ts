import { BlogsRepository } from "../../blogs.repository";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CreatePostInputClassModel } from "../../../../posts/type/postsType";
import { Types } from "mongoose";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../../../posts/application/posts.repository";
import { UserDocument } from "../../../../users/type/users.schema";


export class UpdatePostByBlogCommand {
  constructor(
    public postId: string,
    public UpdatePostDto: CreatePostInputClassModel,
    public user: UserDocument,
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
    if(blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
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