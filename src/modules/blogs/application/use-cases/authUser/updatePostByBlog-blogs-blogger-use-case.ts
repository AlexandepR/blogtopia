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
    public dto: CreatePostInputClassModel,
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
    await validateOrRejectModel(command.dto, CreatePostInputClassModel);
    if(!Types.ObjectId.isValid(command.dto.blogId) || !Types.ObjectId.isValid(command.postId)) {throw new NotFoundException()}
    const blog = await this.blogsRepository.findBlogById(new Types.ObjectId(command.dto.blogId));
    const post = await this.postsRepository.findPostById(new Types.ObjectId(command.postId));
    console.log(blog, '---------blog');
    console.log(post, '---------post');
    if (blog && post) {
      if(blog.blogOwnerInfo.userLogin || post.postOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException()
      // const dtoForPost = {
      //   title: command.UpdatePostDto.title,
      //   shortDescription: command.UpdatePostDto.shortDescription,
      //   content: command.UpdatePostDto.content,
      //   blogId: command.UpdatePostDto.blogId
      // }
      await post.updatePost(command.dto);
      return await post.save();
    }
    throw new NotFoundException()
  }
}