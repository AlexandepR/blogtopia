import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../blogs/type/blogs.schema";
import { Post, PostModelType } from "../posts/type/posts.schema";
import { Comment, CommentModelType } from "../comments/type/comments.schema";
import { User, UserModelType } from "../users/type/users.schema";



@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {
  }

  async deleteAll(): Promise<boolean> {
    // return await mongoose.connection.db.dropDatabase();
    const delBlogs = await this.BlogModel
      .deleteMany({});
    const delPosts = await this.PostModel
      .deleteMany({});
    const delComments = await this.CommentModel
      .deleteMany({});
    const delUsers = await this.UserModel
      .deleteMany({});
    return delBlogs.deletedCount >= 1 &&
      delPosts.deletedCount >= 1  &&
      delComments.deletedCount >= 1  &&
      delUsers.deletedCount >= 1;
  }
}