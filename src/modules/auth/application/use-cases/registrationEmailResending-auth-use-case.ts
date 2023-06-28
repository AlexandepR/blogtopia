import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailService } from "../../../mail/application/managers/email.service";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { checkEmailInputClassModel } from "../../types/auth.types";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';

export class RegistrationEmailResendAuthCommand {
  constructor(
    public dto: checkEmailInputClassModel
  ) {
  }
}

@CommandHandler(RegistrationEmailResendAuthCommand)
export class RegistrationEmailResendAuthUseCase implements ICommandHandler<RegistrationEmailResendAuthCommand> {
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
    protected emailService: EmailService
  ) {
  }
  async execute(command: RegistrationEmailResendAuthCommand) {
    await validateOrRejectModel(command.dto, checkEmailInputClassModel);
    const email = command.dto.email;
    const newCode = uuidv4();
    const findUser = await this.usersSqlRepository.findByLoginOrEmail(email);
    if(findUser.isConfirmed) throw new NotFoundException()
    const userId = findUser.ID.toString();
    const updateCode = await this.usersSqlRepository.updateConfirmCode(userId, newCode);
    if (!updateCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const user = await this.usersSqlRepository.findByLoginOrEmail(email);
    const sendEmail = await this.emailService.sendEmailConfirmationMessage(user);
    if (sendEmail) {
      throw new HttpException("", HttpStatus.NO_CONTENT);
    } else {
      await this.usersSqlRepository.deleteUser(userId);
      return null;
    }
  }
}