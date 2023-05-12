import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PaginationType } from "../types/types";
import { UsersRepository } from "./users.repository";
import { Types } from "mongoose";
import { CreateUserInputModelType, ParamsUsersType, UserType } from "./type/usersTypes";
import { User } from "./type/users.schema";
import { pagesCounter, parseQueryUsersPaginator, skipPage } from "../utils/helpers";


@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    // protected blogsRepository: BlogsRepository
  ) {}

  async findAll(query: ParamsUsersType): Promise<PaginationType<User[]>> {
    // const {searchLoginTerm, searchEmailTerm, pageSize, pageNumber, sortDirection, sortBy} = query
    const { filter, pageSize, pageNumber, sortDirection, sortBy} = parseQueryUsersPaginator(query);
    // const { pageSize, pageNumber, sortDirection, sortBy} = parseQueryUsersPaginator(query);

    const totalCountUsers = await this.usersRepository.getTotalCountUsers(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountUsers, pageSize);
    const users = await this.usersRepository.getUsers(skip, pageSize, filter, sortBy, sortDirection);
    // if (users) {
    //   const usersArray = users.map(({ _id,password, ...rest }) => {
    //       // let userStatus: 'None' | 'Like' | 'Dislike' = 'None';
    //       // if (userId) {
    //       //   const userLike = extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
    //       //   const userDislike = extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
    //       //   userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
    //       // }
    //       return {
    //         id: _id.toString(),
    //         ...rest
    //       };
    //     }
    //   )
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountUsers,
        items: users,
      };
    // }
    return null;
  }
  async getUser(id:string) {
    const userId = new Types.ObjectId(id)
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new HttpException("", HttpStatus.NOT_FOUND);
    return
  }
  async createUser(dto: CreateUserInputModelType): Promise<UserType | null> {
    const createPost = await this.usersRepository.createUser(dto);
    return {
      id: createPost._id.toString(),
      login: createPost.login,
      email: createPost.email,
      createdAt: createPost.createdAt
    }
  }

  async deleteUser(id: string) {
    const userId = new Types.ObjectId(id)
    const findUser = await this.usersRepository.findUserById(userId);
    if (!findUser) throw new HttpException("", HttpStatus.NOT_FOUND);
    const user = await this.usersRepository.deleteUser(userId)
    return user
  }
  async deleteAllUser(): Promise<boolean> {
    return await this.usersRepository.deleteAllUser();
  }

  }