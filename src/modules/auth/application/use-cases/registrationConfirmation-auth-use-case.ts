import { BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel } from "../../../users/type/usersTypes";
import { generateHash, isPasswordCorrect, updateConfirmInfo } from "../../../../utils/helpers";
import { JwtService } from "../jwt.service";
import { EmailService } from "../../../mail/application/managers/email.service";
import { UsersRepository } from "../../../users/application/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { UserDocument } from "../../../users/type/users.schema";
import {
  checkEmailInputClassModel,
  codeInputClassModel,
  loginInputClassModel,
  newPasswordInputModel
} from "../../types/auth.types";
import { UsersService } from "../../../users/application/users.service";
import { SecurityService } from "../../../security/application/security.service";

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
  ) {
  }
  async execute(command: ConfirmRegistrationAuthCommand) {
    await validateOrRejectModel(command.dto, codeInputClassModel);
    const user = await this.usersService.findByConfirmationCode(command.dto.code);
    if (!user || user.emailConfirmation.isConfirmed === true) throw new BadRequestException()
    const dateNow = new Date();
    if (user.emailConfirmation.expirationDate.getTime() - dateNow.getTime() <= 0) {
      await this.usersRepository.deleteUser(user._id);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    if (updateConfirmInfo(user, command.dto.code)) {
      user.emailConfirmation.isConfirmed = true;
      const createUser = await this.usersRepository.save(user)
      if (createUser) throw new HttpException("", HttpStatus.NO_CONTENT);
    }
    throw new HttpException("", HttpStatus.BAD_REQUEST);
  }
}