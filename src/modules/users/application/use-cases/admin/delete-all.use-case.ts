import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../infrastructure/users.repository";

export class DeleteAllUsersByAdminCommand {
  constructor(
  ) {
  }
}

@CommandHandler(DeleteAllUsersByAdminCommand)
export class DeleteAllUsersByAdminUseCase implements ICommandHandler<DeleteAllUsersByAdminCommand> {
  constructor(
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: DeleteAllUsersByAdminCommand) {
    return await this.usersRepository.deleteAllUser();
  }
}