import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogModelType } from "../blogs/type/blogs.schema";
import { Post, PostModelType } from "../posts/type/posts.schema";



@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType
  ) {
  }

  async deleteAll(): Promise<boolean> {
    // return await mongoose.connection.db.dropDatabase();
    const delBlogs = await this.BlogModel
      .deleteMany({});
    const delPosts = await this.PostModel
      .deleteMany({});
    return delBlogs.deletedCount >= 1 && delPosts.deletedCount >= 1;
  }
}