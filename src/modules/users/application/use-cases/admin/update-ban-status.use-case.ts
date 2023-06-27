import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InfoBanStatusClassModel } from '../../../type/usersTypes';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { SecurityRepository } from '../../../../security/infrastructure/security.repository';
import { UsersSqlRepository } from '../../../infrastructure/users.sql-repository';
import { validateIdByUUID } from '../../../../../utils/helpers';
import { SecuritySqlRepository } from '../../../../security/infrastructure/security.sql-repository';

export class UpdateBanInfoByAdminCommand {
  constructor(
    public dto: InfoBanStatusClassModel,
    public userId: string
  ) {
  }
}

@CommandHandler(UpdateBanInfoByAdminCommand)
export class UpdateBanInfoByAdminUseCase implements ICommandHandler<UpdateBanInfoByAdminCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected securityRepository: SecurityRepository,
    protected securitySqlRepository: SecuritySqlRepository,
    protected usersSqlRepository: UsersSqlRepository
  ) {
  }
  async execute(command: UpdateBanInfoByAdminCommand) {
    const userId = validateIdByUUID(command.userId)
    if(!userId) throw new HttpException("", HttpStatus.NOT_FOUND);
    const findUser = await this.usersSqlRepository.findUserById(userId);
    if (!findUser) throw new HttpException("", HttpStatus.NOT_FOUND);
    if (command.dto.isBanned) {
      const updateBanStatus = await this.usersSqlRepository.updateBanStatus(command.dto, userId)
      await this.securitySqlRepository.terminateAllSessions(userId);
      return updateBanStatus
    } else {
      const updateBanStatus = await this.usersSqlRepository.updateBanStatus(command.dto, userId)
      return updateBanStatus
    }
  }
}