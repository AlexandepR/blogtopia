import { PaginationType } from "../../../../../types/types";
import { filterBanStatus, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetUsersOutputModelType, ParamsUsersType } from "../../../type/usersTypes";
import { UsersOrmRepository } from "../../../infrastructure/users.orm-repository";


export class GetUsersByAdminCommand {
  constructor(public query: ParamsUsersType) {
  }
}

@CommandHandler(GetUsersByAdminCommand)
export class GetUsersByAdminUseCase implements ICommandHandler<GetUsersByAdminCommand> {
  constructor(
    protected UsersOrmRepository: UsersOrmRepository) {
  }
  async execute({ query }: GetUsersByAdminCommand): Promise<PaginationType<GetUsersOutputModelType[] | null>> {
    const banStatus = filterBanStatus(query.banStatus)
    const { pageSize, pageNumber, sortDirection, sortBy, searchLoginTerm, searchEmailTerm } = parseQueryPaginator(query);
    const totalCountUsers = await this.UsersOrmRepository.getTotalCountUsers(banStatus, searchLoginTerm, searchEmailTerm);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountUsers, pageSize);
    const allUsers = await this.UsersOrmRepository.getUsers(
      skip,
      pageSize,
      sortBy,
      sortDirection,
      banStatus,
      searchLoginTerm,
      searchEmailTerm,
    );
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCountUsers,
      items: allUsers
    };
  }
}