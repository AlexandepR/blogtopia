import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { SecuritySqlRepository } from '../../infrastructure/security.sql-repository';
import { FindUserType } from '../../../users/type/usersTypes';


export class DeleteDeviceByIdCommand {
  constructor(
    public user: FindUserType,
    public deviceId: string,
  ) {
  }
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase implements ICommandHandler<DeleteDeviceByIdCommand> {
  constructor(
    protected securitySqlRepository: SecuritySqlRepository,
  ) {
  }
  async execute(command: DeleteDeviceByIdCommand) {
    const session = await this.securitySqlRepository.findSessionByDeviceId(command.deviceId);
    if(!session) throw new NotFoundException()
    if (command.user.ID !== session.userId) {
      throw new HttpException('', HttpStatus.FORBIDDEN);}
    const terminateSession = await this.securitySqlRepository.terminateSessionByDeviceId(command.deviceId, command.user.ID);
    if (terminateSession) {throw new HttpException('', HttpStatus.NO_CONTENT)}
    throw new HttpException('', HttpStatus.NOT_FOUND);
  }
}