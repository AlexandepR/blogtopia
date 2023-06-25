import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PaginationType } from "../../../types/types";
import { UsersRepository } from "../infrastructure/users.repository";
import { Types } from "mongoose";
import { CreateUserInputClassModel, ParamsUsersType, UserType } from "../type/usersTypes";
import { User, UserDocument } from "../domain/entities/users.schema";
import { generateHash, pagesCounter, parseQueryUsersPaginator, skipPage } from "../../../utils/helpers";
import { validateOrRejectModel } from "../../../utils/validation.helpers";


// const validateOrRejectModel = async (model: any, ctor: { new(): any }) => {
//   if (!(model instanceof ctor)) {
//     throw new Error("Incorrect input data");
//   }
//   try {
//     await validateOrReject(model);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

@Injectable()
export class UsersService {
  constructor(
    protected usersRepository: UsersRepository
    // protected blogsRepository: BlogsRepository
  ) {
  }
  async findAll(query: ParamsUsersType): Promise<PaginationType<any>> {
    const { filter, pageSize, pageNumber, sortDirection, sortBy } = parseQueryUsersPaginator(query);
    const totalCountUsers = await this.usersRepository.getTotalCountUsers(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountUsers, pageSize);
    const allUsers = await this.usersRepository.getUsers(skip, pageSize, filter, sortBy, sortDirection);
    if (allUsers) {
      const users = allUsers.map(({
                                    _id,
                                    accountData: { login, email, passwordHash, createdAt },
                                    emailConfirmation
                                  }) => ({
          // let userStatus: 'None' | 'Like' | 'Dislike' = 'None';
          // if (userId) {
          //   const userLike = extendedLikesInfo.likesData.find((like) => like.userId.toString() === userId.toString());
          //   const userDislike = extendedLikesInfo.dislikesData.find((dislike) => dislike.userId.toString() === userId.toString());
          //   userStatus = userLike ? 'Like' : userDislike ? 'Dislike' : 'None';
          // }
          // return {
          //
          // };
          id: _id.toString(),
          login: login,
          email: email,
          createdAt: createdAt
        })
      );
      return {
        pagesCount: pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountUsers,
        items: users
      };
    }
    return null;
  }
  async getUser(id: string) {
    const userId = new Types.ObjectId(id);
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new HttpException("", HttpStatus.NOT_FOUND);
    return;
  }
  //   async validateUser(username: string, password: string): Promise<any> {
  //   const user = await this.userService.findByUsername(username);
  //   if (user && user.password === password) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }
  async createUser(dto: CreateUserInputClassModel, ip): Promise<UserType | null> {
    await validateOrRejectModel(dto, CreateUserInputClassModel);
    // const findUserByEmail = await this.usersRepository.findByLoginOrEmail(dto.email);
    // const findUserByLogin = await this.usersRepository.findByLoginOrEmail(dto.login);
    // if (findUserByLogin || findUserByEmail) throw new HttpException('', HttpStatus.BAD_REQUEST);
    const passwordHash = await generateHash(dto.password);
    const confirmEmail = true;
    const createUser = await this.usersRepository.createUser(dto, passwordHash, ip, confirmEmail);
    return {
      id: createUser._id.toString(),
      login: createUser.accountData.login,
      email: createUser.accountData.email,
      createdAt: createUser.accountData.createdAt
    };
  }
  async findUserById(id: string): Promise<UserDocument> {
    const userId = new Types.ObjectId(id);
    const user = await this.usersRepository.findUserById(userId);
    if (!user) throw new HttpException("", HttpStatus.NOT_FOUND);
    return user;
  }
  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
  // async findUserByLoginOrEmail(login?: string, email?: string): Promise<UserDocument | null> {
    const findUser = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (findUser) {
      return findUser;
    } else {
      return null;
    }
  }
  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    let findUser = await this.usersRepository.findByConfirmationCode(code);
    if (findUser) {
      return findUser;
    }
    return null;
  }
  async deleteUser(id: string) {
    const userId = new Types.ObjectId(id);
    const findUser = await this.usersRepository.findUserById(userId);
    if (!findUser) throw new HttpException("", HttpStatus.NOT_FOUND);
    const user = await this.usersRepository.deleteUser(userId);
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
  async deleteAllUser(): Promise<boolean> {
    return await this.usersRepository.deleteAllUser();
  }

}