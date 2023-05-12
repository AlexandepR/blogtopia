import { Injectable } from "@nestjs/common";
import { PaginationType } from "../types/types";
import { UsersRepository } from "./users.repository";
import { Types } from "mongoose";
import { CreateUserInputModelType, ParamsUsersType, UserType } from "./type/usersTypes";


@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository,
    // protected blogsRepository: BlogsRepository
  ) {}

  async findAll(query: ParamsUsersType): Promise<PaginationType<UserType[]>> {
    const {searchLoginTerm, searchEmailTerm, pageSize, pageNumber, sortDirection, sortBy} = query
    // const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryPaginator(query);
    let filter = {}
    if (searchLoginTerm) {
      filter['login'] = { $regex: searchLoginTerm, $options: 'i' };
    }

    if (searchEmailTerm) {
      filter['email'] = { $regex: searchEmailTerm, $options: 'i' };
    }

    if (searchLoginTerm && searchEmailTerm) {
      filter['$or'] = [    { 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } },    { 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } }  ];
    }
    // const filter = term ? { name: { $regex: term, $options: "i" } } : {};
    const totalCountUsers = await this.usersRepository.getTotalCountUsers(filter);
    const skip = (pageNumber - 1) * pageSize;
    const pagesCount = Math.ceil(totalCountUsers / pageSize);
    const users = await this.usersRepository.getUsers(pageSize, skip, filter, sortBy, sortDirection);
    if (users) {
      const usersArray = users.map(({ _id, ...rest }) => {
          // let userStatus: 'None' | 'Like' | 'Dislike' = 'None';
          // if (userId) {
          //   const userLike = extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
          //   const userDislike = extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
          //   userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
          // }
          return {
            id: _id.toString(),
            ...rest
          };
        }
      )
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountUsers,
        items: usersArray,
      };
    }
    return null;
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
    return await this.usersRepository.deleteUser(userId)
  }
  async deleteAllUser(): Promise<boolean> {
    return await this.usersRepository.deleteAllUser();
  }

  }