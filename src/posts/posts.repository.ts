import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostDocument, PostModelType } from "../posts/type/posts.schema";
import { BlogDocument } from "../blogs/type/blogs.schema";
import { CreatePostInputModelType, PostsNewestLikesType, PostsType } from "../posts/type/postsType";
import { ObjectId } from "mongodb";
import { CreateCommentInputClassModel } from "./posts.service";
import { Comment, CommentModelType } from "../comments/type/comments.schema";
import { Types } from "mongoose";
import { UserDocument } from "../users/type/users.schema";

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    ) {
  }
  async getPosts(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Promise<any> {
    const posts = await this.PostModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize)
      .lean();
    return posts;
  }
  async createPost(createDto: CreatePostInputModelType, blog: BlogDocument): Promise<Post> {
    const newPost = Post.create(createDto, blog, this.PostModel);
    return newPost.save();
  }
  async createComment(content: string, postId: Types.ObjectId, user: UserDocument): Promise<any> {
    const newComment = Comment.createComment( content, postId, this.CommentModel, user);
    return newComment.save();
  }
  async findPostById(postId: ObjectId): Promise<PostDocument> {
    const post = await this.PostModel
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
  async checkLikesInfo(postId: Types.ObjectId, userId: ObjectId, updateField: string): Promise<boolean> {
    const field = `extendedLikesInfo.${updateField}`;
    const result = await this.PostModel
      .updateMany(
        { _id: postId },
        { $pull: { [field]: { userId: userId } } },
      );
    return result.modifiedCount > 0;
  }
  async checkNewestLikes(postId: ObjectId, userId: ObjectId): Promise<boolean> {
    const checkNewestLikes = await this.PostModel
      .updateMany(
        { _id: postId },
        { $pull: { 'extendedLikesInfo.newestLikes': { userId: userId } } }
      );
    return checkNewestLikes.modifiedCount > 0;
  }
  async findLikesStatus(postId: ObjectId, userId?: ObjectId | null): Promise<'None' | 'Like' | 'Dislike'> {
    if (!userId) return 'None';
    const findLikeStatus = await this.PostModel
      .findOne(
        { _id: postId, 'extendedLikesInfo.likesData': { $elemMatch: { userId: userId } } }
      )
      .lean();
    if (findLikeStatus) return 'Like';
    const findDislikeStatus = await this.PostModel
      .findOne(
        { _id: postId, 'extendedLikesInfo.dislikesData': { $elemMatch: { userId: userId } } }
      )
      .lean();
    if (findDislikeStatus) return 'Dislike';
    return 'None';
  }
  async updateNewestLikes(postId: ObjectId, newesetLike: PostsNewestLikesType): Promise<boolean> {
    const updateNewestLike = await this.PostModel.updateOne(
      { _id: postId },
      {
        $push: {
          'extendedLikesInfo.newestLikes': {
            $each: [newesetLike],
            $sort: { 'addedAt': -1 },
            $slice: 3
          }
        },
      }
    );
    return updateNewestLike.modifiedCount > 0;
  }
  async updatePostLikesInfo(post: PostDocument, postId: ObjectId): Promise<boolean> {
    const updatePost = await this.PostModel
      .updateOne({ _id: postId }, {
        $set:
          {
            'extendedLikesInfo.likesData': post.extendedLikesInfo.likesData,
            'extendedLikesInfo.dislikesData': post.extendedLikesInfo.dislikesData,
            'extendedLikesInfo.likesCount': post!.extendedLikesInfo.likesData.length,
            'extendedLikesInfo.dislikesCount': post!.extendedLikesInfo.dislikesData.length,
          }
      });
    return !!updatePost;
  }
}
