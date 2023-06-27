import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailService } from "../../../mail/application/managers/email.service";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { checkEmailInputClassModel } from "../../types/auth.types";
import { v4 as uuidv4 } from "uuid";
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';

export class PasswordRecoveryAuthCommand {
  constructor(
    public dto: checkEmailInputClassModel
  ) {
  }
}

@CommandHandler(PasswordRecoveryAuthCommand)
export class PasswordRecoveryAuthUseCase implements ICommandHandler<PasswordRecoveryAuthCommand> {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
    protected emailService: EmailService
  ) {}
  async execute(command: PasswordRecoveryAuthCommand) {
    await validateOrRejectModel(command.dto, checkEmailInputClassModel);
    const newCode = uuidv4();
    const updatePassRecoveryCode = await this.usersSqlRepository.updatePassRecoveryCode(command.dto.email, newCode);
    if (!updatePassRecoveryCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const sendCode = await this.emailService.sendEmailRecoveryPassCode(command.dto.email, newCode);
    if (!sendCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    else throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}