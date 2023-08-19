import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { generateHash } from "../../../../utils/helpers";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { newPasswordInputModel } from "../../types/auth.types";
import { UsersOrmRepository } from "../../../users/infrastructure/users.orm-repository";

export class NewPasswordAuthCommand {
  constructor(
    public dto: newPasswordInputModel
  ) {
  }
}

@CommandHandler(NewPasswordAuthCommand)
export class NewPasswordAuthUseCase implements ICommandHandler<NewPasswordAuthCommand> {
  constructor(
    protected usersOrmRepository: UsersOrmRepository,
  ) {
  }
  async execute({ dto, dto: { recoveryCode, newPassword } }: NewPasswordAuthCommand) {
    await validateOrRejectModel(dto, newPasswordInputModel);
    const checkCode = await this.usersOrmRepository.checkRecoveryCode(recoveryCode);
    if (!checkCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const passHash = await generateHash(newPassword);
    const updateHash = await this.usersOrmRepository.updatePassHash(recoveryCode, passHash);
    if (!updateHash || !checkCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const deleteCode = await this.usersOrmRepository.deleteRecoveryCode(recoveryCode);
    if (deleteCode) throw new HttpException("", HttpStatus.NO_CONTENT);
  }
}