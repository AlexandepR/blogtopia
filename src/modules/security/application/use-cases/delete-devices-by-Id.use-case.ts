import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { UserType } from "../../../users/type/usersTypes";
import { SecurityOrmRepository } from "../../infrastructure/security.orm-repository";


export class DeleteDeviceByIdCommand {
  constructor(
    public user: UserType,
    public deviceId: string
  ) {
  }
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase implements ICommandHandler<DeleteDeviceByIdCommand> {
  constructor(
    protected securityOrmRepository: SecurityOrmRepository
  ) {
  }
  async execute({ deviceId, user }: DeleteDeviceByIdCommand) {
    const session = await this.securityOrmRepository.findSessionByDeviceId(deviceId);
    if (!session) throw new NotFoundException();
    if (user.ID !== session.userId) {
      throw new HttpException("", HttpStatus.FORBIDDEN);
    }
    const terminateSession = await this.securityOrmRepository.terminateSessionByDeviceId(deviceId, user.ID);
    if (terminateSession) {
      throw new HttpException("", HttpStatus.NO_CONTENT);
    }
    throw new HttpException("", HttpStatus.NOT_FOUND);
  }
}