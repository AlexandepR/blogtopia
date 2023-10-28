import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersOrmRepository } from "../../../infrastructure/users.orm-repository";

export class DeleteAllUsersByAdminCommand {
  constructor(
  ) {
  }
}

@CommandHandler(DeleteAllUsersByAdminCommand)
export class DeleteAllUsersByAdminUseCase implements ICommandHandler<DeleteAllUsersByAdminCommand> {
  constructor(
    protected usersOrmRepository: UsersOrmRepository,
  ) {
  }
  async execute(command: DeleteAllUsersByAdminCommand) {
    return await this.usersOrmRepository.deleteAllUser();
  }
}