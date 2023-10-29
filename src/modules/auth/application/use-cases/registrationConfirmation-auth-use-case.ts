import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { updateConfirmInfo } from "../../../../utils/helpers";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { codeInputClassModel } from "../../types/auth.types";
import { UsersOrmRepository } from "../../../users/infrastructure/users.orm-repository";

export class ConfirmRegistrationAuthCommand {
  constructor(
    public dto: codeInputClassModel,
  ) {}
}

@CommandHandler(ConfirmRegistrationAuthCommand)
export class ConfirmRegistrationAuthUseCase implements ICommandHandler<ConfirmRegistrationAuthCommand> {
  constructor(
    protected usersOrmRepository: UsersOrmRepository,
  ) {
  }
  async execute(command: ConfirmRegistrationAuthCommand) {
    await validateOrRejectModel(command.dto, codeInputClassModel);
    const user = await this.usersOrmRepository.findByConfirmationCode(command.dto.code);
    if (!user || user.isConfirmed === true) throw new BadRequestException();
    const expConfirmCodeDate = new Date(user.expConfirmCodeDate)
    const dateNow = new Date();
    if (expConfirmCodeDate.getTime() - dateNow.getTime() <= 0) {
      await this.usersOrmRepository.deleteUser(user.ID);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    if (updateConfirmInfo(user, command.dto.code)) {
      const isConfirmed = user.isConfirmed = true;
      const createUser = await this.usersOrmRepository.updateConfirmStatus(user.ID, isConfirmed)
      if (createUser) throw new HttpException("", HttpStatus.NO_CONTENT);
    }
    throw new HttpException("", HttpStatus.BAD_REQUEST);
  }
}