import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel } from "../../../users/type/usersTypes";
import { generateHash } from "../../../../utils/helpers";
import { EmailService } from "../../../mail/application/managers/email.service";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { UsersOrmRepository } from "../../../users/infrastructure/users.orm-repository";

export class RegistrationAuthCommand {
  constructor(
    public dto: CreateUserInputClassModel,
    public ip: any
  ) {
  }
}

@CommandHandler(RegistrationAuthCommand)
export class RegistrationAuthUseCase implements ICommandHandler<RegistrationAuthCommand> {
  constructor(
    protected emailService: EmailService,
    protected usersOrmRepository: UsersOrmRepository
  ) {
  }
  async execute({ dto, ip, dto: { email, login, password } }: RegistrationAuthCommand) {
    await validateOrRejectModel(dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(password);
    const confirmEmail = false;
    const findUserByEmail = await this.usersOrmRepository.findByLoginOrEmail(email);
    const findUserByLogin = await this.usersOrmRepository.findByLoginOrEmail(login);
    if (findUserByLogin || findUserByEmail) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const user = await this.usersOrmRepository.createUser(dto, passwordHash, ip, confirmEmail);
    try {
      await this.emailService.sendEmailConfirmationMessage(user);
    } catch (error) {
      await this.usersOrmRepository.deleteUser(user.id);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}