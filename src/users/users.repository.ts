import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument, PostModelStaticType, PostModelType } from "../posts/type/posts.schema";
import { CreateBlogInputModelType } from "../blogs/type/blogsType";
import { Blog, BlogDocument } from "../blogs/type/blogs.schema";
import { CreatePostInputModelType } from "../posts/type/postsType";
import { ObjectId } from "mongodb";
import { User, UserDocument, UserModelType } from "./type/users.schema";
import { CreateUserInputModelType } from "./type/usersTypes";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType) {
  }
  async getUsers(
    skip: number,
    pageSize: number,
    filter: any,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Promise<User[]> {
    const users = await this.UserModel
      .find(filter)
      .sort([[sortBy, sortDirection]])
      .skip(skip)
      .limit(pageSize)
      .lean()
    return users
  }
  async getTotalCountUsers(filter: any): Promise<number> {
    const count = await this.UserModel
      .countDocuments(filter);
    return count;
  }
  async findUserById(id: ObjectId) {
    return this.UserModel
      .findOne({_id: id})
  }
  async createUser(userDto: CreateUserInputModelType): Promise<User> {
    const user = User.create(userDto, this.UserModel);
    // const newBlog = this.BlogModel.create(createDto, this.BlogModel);
    return user.save();
  }
  async deleteUser(id: ObjectId): Promise<boolean> {
    const deleteUser = await this.UserModel
      .deleteOne({ _id: id });
    return !!deleteUser;
  }
  async deleteAllUser(): Promise<boolean> {
    const delusers = await this.UserModel
      .deleteMany({});
    return delusers.deletedCount >= 1;
  }


}
