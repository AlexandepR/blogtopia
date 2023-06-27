import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { generateHash } from "../../../../utils/helpers";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { newPasswordInputModel } from "../../types/auth.types";
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';

export class NewPasswordAuthCommand {
  constructor(
    public dto: newPasswordInputModel,
  ) {}
}

@CommandHandler(NewPasswordAuthCommand)
export class NewPasswordAuthUseCase implements ICommandHandler<NewPasswordAuthCommand>{
  constructor(
    protected usersSqlRepository: UsersSqlRepository,
  ) {
  }
  async execute(command: NewPasswordAuthCommand) {
    await validateOrRejectModel(command.dto, newPasswordInputModel);
    const code = command.dto.recoveryCode
    const test = command.dto.newPassword
    const checkCode = await this.usersSqlRepository.checkRecoveryCode(code);
    if(!checkCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const passHash = await generateHash(command.dto.newPassword);
    const updateHash = await this.usersSqlRepository.updatePassHash(code, passHash)
    if (!updateHash || !checkCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const deleteCode = await this.usersSqlRepository.deleteRecoveryCode(code)
    if (deleteCode)throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}