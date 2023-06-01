import { PaginationType } from "../../../../types/types";
import { BlogDocument } from "../../../blogs/type/blogs.schema";
import { pagesCounter, parseQueryUsersPaginator, skipPage } from "../../../../utils/helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../users.repository";
import { GetUsersOutputModelType, ParamsUsersType } from "../../type/usersTypes";
import { UserDocument } from "../../type/users.schema";


export class GetUsersByAdminCommand {
  constructor(
    public query: ParamsUsersType
  ) {
  }
}

@CommandHandler(GetUsersByAdminCommand)
export class GetUsersByAdminUseCase implements ICommandHandler<GetUsersByAdminCommand> {
  constructor(
    protected usersRepository: UsersRepository
  ) {
  }
  async execute(command: GetUsersByAdminCommand): Promise<PaginationType<GetUsersOutputModelType[]>> {
    const { filter, pageSize, pageNumber, sortDirection, sortBy } = parseQueryUsersPaginator(command.query);
    const totalCountUsers = await this.usersRepository.getTotalCountUsers(filter);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountUsers, pageSize);
    const allUsers = await this.usersRepository.getUsers(skip, pageSize, filter, sortBy, sortDirection);
    if (allUsers) {
      const users = allUsers.map(({
                                    _id,
                                    accountData: { login, email, passwordHash, createdAt, banInfo },
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
          createdAt: createdAt,
          banInfo,
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
}