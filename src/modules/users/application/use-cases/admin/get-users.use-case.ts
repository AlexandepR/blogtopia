import { PaginationType } from '../../../../../types/types';
import { filterGetUsers, pagesCounter, parseQueryUsersPaginator, skipPage } from '../../../../../utils/helpers';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetUsersOutputModelType, ParamsUsersType } from '../../../type/usersTypes';
import { UsersSqlRepository } from '../../../infrastructure/users.sql-repository';


export class GetUsersByAdminCommand {
    constructor(public query: ParamsUsersType) {
    }
}

@CommandHandler(GetUsersByAdminCommand)
export class GetUsersByAdminUseCase implements ICommandHandler<GetUsersByAdminCommand> {
    constructor(protected usersSqlRepository: UsersSqlRepository) {
    }
    async execute(command: GetUsersByAdminCommand): Promise<PaginationType<GetUsersOutputModelType[] | null>> {
        const filter = filterGetUsers(command.query);
        const { pageSize, pageNumber, sortDirection, sortBy } = parseQueryUsersPaginator(command.query);
        const totalCountUsers = await this.usersSqlRepository.getTotalCountUsers(filter);
        const skip = skipPage(pageNumber, pageSize);
        const pagesCount = pagesCounter(totalCountUsers, pageSize);
        const allUsers = await this.usersSqlRepository.getUsers(skip, pageSize, filter, sortBy, sortDirection);
        return {
            pagesCount: pagesCount,
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountUsers,
            items: allUsers
        };
    }
}