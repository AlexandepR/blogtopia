import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostDocument, PostModelType } from "../posts/type/posts.schema";
import { BlogDocument } from "../blogs/type/blogs.schema";
import { CreatePostInputModelType } from "../posts/type/postsType";
import { ObjectId } from "mongodb";

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType) {
  }
  async getPosts(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Promise<PostDocument[]> {
    const posts = await this.PostModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize)
    return posts
  }
  async createPost(createDto: CreatePostInputModelType,blog: BlogDocument): Promise<Post> {
    const newPost = Post.create(createDto,blog, this.PostModel);
    return newPost.save();
  }
  async findPostById(postId: ObjectId): Promise<PostDocument> {
    const post = this.PostModel
      .findOne({ _id: postId });
    return post;
  }

  async save(post: PostDocument) {
    await post.save();
  }
  async delete(id: ObjectId): Promise<boolean> {
    const deletePost = await this.PostModel
      .deleteOne({ _id: id });
    return !!deletePost;
  }
  async deleteAllPosts(): Promise<boolean> {
    const delPost = await this.PostModel
      .deleteMany({});
    return delPost.deletedCount >= 1;
  }

  async getTotalCountPosts(filter: any): Promise<number> {
    const count = await this.PostModel
      .countDocuments(filter);
    return count;
  }




}
