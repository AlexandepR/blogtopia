import { PaginationType } from "../../../../../types/types";
import { filterBanStatus, pagesCounter, parseQueryPaginator, skipPage } from "../../../../../utils/helpers";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetUsersOutputModelType, ParamsUsersType } from "../../../type/usersTypes";
import { UsersOrmRepository } from "../../../infrastructure/users.orm-repository";
import { GetUsersByAdminCommand } from "./get-users.use-case";


export class GetBannedUsersByAdminCommand {
  constructor(public query: ParamsUsersType) {
  }
}

@CommandHandler(GetBannedUsersByAdminCommand)
export class GetBannedUsersByAdminUseCase implements ICommandHandler<GetBannedUsersByAdminCommand> {
  constructor(
    protected usersOrmRepository: UsersOrmRepository) {
  }
  async execute({ query }: GetUsersByAdminCommand): Promise<PaginationType<GetUsersOutputModelType[] | null>> {
    const { pageSize, pageNumber, sortDirection, sortBy, searchLoginTerm, searchEmailTerm } = parseQueryPaginator(query);
    const totalCountUsers = await this.usersOrmRepository.getTotalCountUsers(true, searchLoginTerm, searchEmailTerm);
    const skip = skipPage(pageNumber, pageSize);
    const pagesCount = pagesCounter(totalCountUsers, pageSize);
    const allUsers = await this.usersOrmRepository.getBannedUsers(
      skip,
      pageSize,
      sortBy,
      sortDirection,
      true,
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