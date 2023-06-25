import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailService } from "../../../mail/application/managers/email.service";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { checkEmailInputClassModel } from "../../types/auth.types";
import { v4 as uuidv4 } from "uuid";
import { Types } from "mongoose";

export class RegistrationEmailResendAuthCommand {
  constructor(
    public dto: checkEmailInputClassModel
  ) {
  }
}

@CommandHandler(RegistrationEmailResendAuthCommand)
export class RegistrationEmailResendAuthUseCase implements ICommandHandler<RegistrationEmailResendAuthCommand> {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailService: EmailService
  ) {
  }
  async execute(command: RegistrationEmailResendAuthCommand) {
    await validateOrRejectModel(command.dto, checkEmailInputClassModel);
    const email = command.dto.email;
    const newCode = uuidv4();
    const findUser = await this.usersRepository.findByLoginOrEmail(email);
    // if (!findUser || findUser.emailConfirmation.isConfirmed === true) throw new BadRequestException()
    const userId = new Types.ObjectId(findUser._id.toString());
    const userUpdateCode = await this.usersRepository.updateConfirmCode(userId, newCode);
    if (!userUpdateCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const sendEmail = await this.emailService.sendEmailConfirmationMessage(userUpdateCode);
    if (sendEmail) {
      throw new HttpException("", HttpStatus.NO_CONTENT);
    } else {
      await this.usersRepository.deleteUser(userId);
      return null;
    }
  }
}