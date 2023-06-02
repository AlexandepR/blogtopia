import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotFoundException } from "@nestjs/common";
import { InfoBanStatusClassModel } from "../../type/usersTypes";
import { UsersRepository } from "../users.repository";
import { Types } from "mongoose";
import { SecurityRepository } from "../../../security/application/security.repository";

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
    protected securityRepository: SecurityRepository
  ) {
  }
  async execute(command: UpdateBanInfoByAdminCommand) {
    const user = await this.usersRepository.findUserById(new Types.ObjectId(command.userId));
    if (!user) throw new NotFoundException();
    if (command.dto.isBanned) {
      user.banUser(command.dto);
      await this.securityRepository.terminateAllSessions(new Types.ObjectId(command.userId));
      return await this.usersRepository.save(user);
    } else {
      user.unBanUser();
      return await this.usersRepository.save(user);
    }
  }
}