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
import { v4 as uuidv4 } from "uuid";

export class PasswordRecoveryAuthCommand {
  constructor(
    public dto: checkEmailInputClassModel
  ) {
  }
}

@CommandHandler(PasswordRecoveryAuthCommand)
export class PasswordRecoveryAuthUseCase implements ICommandHandler<PasswordRecoveryAuthCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailService: EmailService
  ) {}
  async execute(command: PasswordRecoveryAuthCommand) {
    await validateOrRejectModel(command.dto.email, checkEmailInputClassModel);
    const newCode = uuidv4();
    const updatePassRecoveryCode = await this.usersRepository.updatePassRecoveryCode(command.dto.email, newCode);
    if (!updatePassRecoveryCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const sendCode = await this.emailService.sendEmailRecoveryPassCode(command.dto.email, newCode);
    if (!sendCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    else throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}