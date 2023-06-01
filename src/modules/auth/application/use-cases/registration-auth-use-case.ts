import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel } from "../../../users/type/usersTypes";
import { generateHash } from "../../../../utils/helpers";
import { JwtService } from "../jwt.service";
import { EmailService } from "../../../mail/application/managers/email.service";
import { UsersRepository } from "../../../users/application/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { UserDocument } from "../../../users/type/users.schema";

export class RegistrationAuthCommand {
  constructor(
    public dto: CreateUserInputClassModel,
    public ip: any
  ) {}
}

@CommandHandler(RegistrationAuthCommand)
export class RegistrationAuthUseCase implements ICommandHandler<RegistrationAuthCommand>{
  constructor(
    protected jwtService: JwtService,
    // protected usersService: UsersService,
    protected emailService: EmailService,
    protected usersRepository: UsersRepository,
    // protected securityService: SecurityService,
  ) {
  }
  async execute(command: RegistrationAuthCommand) {
    await validateOrRejectModel(command.dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(command.dto.password);
    const confirmEmail = false;
    const findUserByEmail = await this.usersRepository.findByLoginOrEmail(command.dto.email);
    const findUserByLogin = await this.usersRepository.findByLoginOrEmail(command.dto.login);
    if (findUserByLogin || findUserByEmail) throw new HttpException('', HttpStatus.BAD_REQUEST);
    const user: UserDocument = await this.usersRepository.createUser(command.dto, passwordHash, command.ip, confirmEmail);
    try {
      await this.emailService.sendEmailConfirmationMessage(user);
    } catch (error) {
      await this.usersRepository.deleteUser(user._id);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}