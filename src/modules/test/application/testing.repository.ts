import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument, BlogModelType } from "../../blogs/type/blogs.schema";
import { Post, PostModelType } from "../../posts/type/posts.schema";
import { Comment, CommentModelType } from "../../comments/type/comments.schema";
import { User, UserModelType } from "../../users/type/users.schema";
import { Model } from "mongoose";
import { Security } from "../../security/type/security.schema";



@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<Blog>,
    @InjectModel(Post.name) private PostModel: Model<Post>,
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Security.name) private SecurityModel: Model<Security>,
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
    const delSecurity = await this.SecurityModel
      .deleteMany({});
    return delBlogs.deletedCount >= 1 &&
      delPosts.deletedCount >= 1  &&
      delComments.deletedCount >= 1  &&
      delSecurity.deletedCount >= 1  &&
      delUsers.deletedCount >= 1;
  }
}