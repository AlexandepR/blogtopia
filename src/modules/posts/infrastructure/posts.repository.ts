import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Post, PostDocument, PostModelType } from "../domain/entities/posts.schema";
import { BlogDocument } from "../../blogs/domain/entities/blogs.schema";
import { CreatePostInputModelType, PostsNewestLikesType, PostsType } from "../type/postsType";
import { ObjectId } from "mongodb";
import { CreateCommentInputClassModel } from "../application/posts.service";
import { Comment, CommentModelType } from "../../comments/type/comments.schema";
import { Types } from "mongoose";
import { User, UserDocument, UserModelType } from "../../users/domain/entities/users.schema";
import { filterBanPostLikesInfo, filterBanPostsLikesInfo } from "../../../utils/helpers";

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(User.name) private UserModel: UserModelType
  ) {
  }
  async getPosts(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc",
    banUsers: Array<string>
  ): Promise<any> {
    const posts = await this.PostModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize)
      .lean();
    const filteredPosts = filterBanPostsLikesInfo(posts, banUsers);
    // posts.map(post => {
    //   if (post.extendedLikesInfo && post.extendedLikesInfo.newestLikes) {
    //     post.extendedLikesInfo.newestLikes = post.extendedLikesInfo.newestLikes.filter(
    //       like => !banUsers.includes(like.login)
    //     );
    //     post.extendedLikesInfo.likesData = post.extendedLikesInfo.likesData.filter(
    //       like => !banUsers.includes(like.userLogin)
    //     );
    //     post.extendedLikesInfo.dislikesData = post.extendedLikesInfo.dislikesData.filter(
    //       like => !banUsers.includes(like.userLogin)
    //     );
    //     post!.extendedLikesInfo.likesCount = post!.extendedLikesInfo.likesData.length;
    //     post!.extendedLikesInfo.dislikesCount = post!.extendedLikesInfo.dislikesData.length;
    //   }
    //   return post;
    // });
    return filteredPosts;
  }
  async getArrayIdOwnPosts(userId: Types.ObjectId) {
    const posts = await this.PostModel
      .find({ "postOwnerInfo.userId": userId });
    const arrPostsId = posts.map((post) => post._id);
    return arrPostsId;
  }
  async createPost(createDto: CreatePostInputModelType, blog: BlogDocument, user: UserDocument): Promise<Post> {
    const newPost = Post.create(createDto, blog, user, this.PostModel);
    return newPost.save();
  }
  async createComment(content: string, post: PostDocument, user: UserDocument): Promise<any> {
    const newComment = Comment.createComment(content, post, this.CommentModel, user);
    return newComment.save();
  }
  async findPostByIdWithFilter(
    postId: Types.ObjectId,
    filter: any,
    banUsers: Array<string>
  ): Promise<PostDocument> {
      const query = { $and: [{ _id: postId }, filter] };
    // }
    const post = await this.PostModel
      .findOne(query)
    const filteredPosts = filterBanPostLikesInfo(post, banUsers)
    if (filteredPosts) {
      return filteredPosts;
    } else {
      return null;
    }
  }
  async findPostById(postId: Types.ObjectId): Promise<PostDocument> {
    const blog = await this.PostModel
      .findOne({ _id: postId });
    return blog;
  }
  async findPostByIdForBlogger(postId: Types.ObjectId, filter?): Promise<PostDocument> {
      const query = { $and: [{ _id: postId }, filter] };
    const post = await this.PostModel
      .findOne(query);
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
        { $pull: { [field]: { userId: userId } } }
      );
    return result.modifiedCount > 0;
  }
  async checkNewestLikes(postId: ObjectId, userId: ObjectId): Promise<boolean> {
    const checkNewestLikes = await this.PostModel
      .updateMany(
        { _id: postId },
        { $pull: { "extendedLikesInfo.newestLikes": { userId: userId } } }
      );
    return checkNewestLikes.modifiedCount > 0;
  }
  // async findLikesStatus(postId: ObjectId, userId?: ObjectId | null): Promise<"None" | "Like" | "Dislike"> {
  //   if (!userId) return "None";
  //   const findLikeStatus = await this.PostModel
  //     .findOne(
  //       { _id: postId, "extendedLikesInfo.likesData": { $elemMatch: { userId: userId } } }
  //     )
  //     .lean();
  //   if (findLikeStatus) return "Like";
  //   const findDislikeStatus = await this.PostModel
  //     .findOne(
  //       { _id: postId, "extendedLikesInfo.dislikesData": { $elemMatch: { userId: userId } } }
  //     )
  //     .lean();
  //   if (findDislikeStatus) return "Dislike";
  //   return "None";
  // }
  async updateNewestLikes(postId: ObjectId, newesetLike: PostsNewestLikesType): Promise<boolean> {
    const updateNewestLike = await this.PostModel.updateOne(
      { _id: postId },
      {
        $push: {
          "extendedLikesInfo.newestLikes": {
            $each: [newesetLike],
            $sort: { "addedAt": -1 },
            $slice: 3
          }
        }
      }
    );
    return updateNewestLike.modifiedCount > 0;
  }
  async updatePostLikesInfo(post: PostDocument, postId: ObjectId): Promise<boolean> {
    const updatePost = await this.PostModel
      .updateOne({ _id: postId }, {
        $set:
          {
            "extendedLikesInfo.likesData": post.extendedLikesInfo.likesData,
            "extendedLikesInfo.dislikesData": post.extendedLikesInfo.dislikesData,
            "extendedLikesInfo.likesCount": post!.extendedLikesInfo.likesData.length,
            "extendedLikesInfo.dislikesCount": post!.extendedLikesInfo.dislikesData.length
          }
      });
    return !!updatePost;
  }
}
