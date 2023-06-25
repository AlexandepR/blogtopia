import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserDocument } from "../../../users/domain/entities/users.schema";
import { DevicesResDataType } from "../../type/security.types";
import { SecurityRepository } from "../security.repository";


export class DeleteDeviceByIdCommand {
  constructor(
    public user: UserDocument,
    public deviceId: string,
  ) {
  }
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase implements ICommandHandler<DeleteDeviceByIdCommand> {
  constructor(
    protected securityRepository: SecurityRepository,
  ) {
  }
  async execute(command: DeleteDeviceByIdCommand) {
    const session = await this.securityRepository.findSessionByDeviceId(command.deviceId);
    if(!session) throw new NotFoundException()
    if (command.user._id.toString() !== session.userId.toString()) {
      throw new HttpException('', HttpStatus.FORBIDDEN);}
    const terminateSession = await this.securityRepository.terminateSessionByDeviceId(command.deviceId);
    if (terminateSession) {throw new HttpException('', HttpStatus.NO_CONTENT)}
    throw new HttpException('', HttpStatus.NOT_FOUND);
  }
}