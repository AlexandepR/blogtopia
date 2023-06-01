import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel, UserType } from "../../type/usersTypes";
import { UsersRepository } from "../users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { generateHash } from "../../../../utils/helpers";
import { Types } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";

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