import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel, UserType } from "../../../type/usersTypes";
import { UsersRepository } from "../../users.repository";
import { validateOrRejectModel } from "../../../../../utils/validation.helpers";
import { generateHash } from "../../../../../utils/helpers";
import { Types } from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";

export class DeleteUserByAdminCommand {
  constructor(
    public id: string,
  ) {
  }
}

@CommandHandler(DeleteUserByAdminCommand)
export class DeleteUserByAdminUseCase implements ICommandHandler<DeleteUserByAdminCommand> {
  constructor(
    protected usersRepository: UsersRepository,
  ) {
  }
  async execute(command: DeleteUserByAdminCommand) {
    const userId = new Types.ObjectId(command.id);
    const findUser = await this.usersRepository.findUserById(userId);
    if (!findUser) throw new HttpException("", HttpStatus.NOT_FOUND);
    const user = await this.usersRepository.deleteUser(userId);
    if (!user) throw new HttpException("", HttpStatus.NOT_FOUND);
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}