import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { updateConfirmInfo } from "../../../../utils/helpers";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { codeInputClassModel } from "../../types/auth.types";
import { UsersService } from "../../../users/application/users.service";
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';

export class ConfirmRegistrationAuthCommand {
  constructor(
    public dto: codeInputClassModel,
  ) {}
}

@CommandHandler(ConfirmRegistrationAuthCommand)
export class ConfirmRegistrationAuthUseCase implements ICommandHandler<ConfirmRegistrationAuthCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
    protected UsersSqlRepository: UsersSqlRepository,
  ) {
  }
  async execute(command: ConfirmRegistrationAuthCommand) {
    await validateOrRejectModel(command.dto, codeInputClassModel);
    const user = await this.UsersSqlRepository.findByConfirmationCode(command.dto.code);
    if (!user || user.isConfirmed === true) throw new BadRequestException();
    const expConfirmCodeDate = new Date(user.expConfirmCodeDate)
    const dateNow = new Date();
    if (expConfirmCodeDate.getTime() - dateNow.getTime() <= 0) {
      await this.UsersSqlRepository.deleteUser(user.ID);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    if (updateConfirmInfo(user, command.dto.code)) {
      const isConfirmed = user.isConfirmed = true;
      const createUser = await this.UsersSqlRepository.updateConfirmStatus(user.ID, isConfirmed)
      if (createUser) throw new HttpException("", HttpStatus.NO_CONTENT);
    }
    throw new HttpException("", HttpStatus.BAD_REQUEST);
  }
}