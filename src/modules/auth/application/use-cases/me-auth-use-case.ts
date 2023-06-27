import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Request } from "express";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';

export class getOwnAccountAuthCommand {
  constructor(
    public req: Request
  ) {
  }
}
@CommandHandler(getOwnAccountAuthCommand)
export class getOwnAccountAuthUseCase implements ICommandHandler<getOwnAccountAuthCommand> {
  constructor(
    protected usersSqlRepository: UsersSqlRepository
  ) {
  }
  async execute(command: getOwnAccountAuthCommand) {
    const userId = command.req.requestUser.ID;
    if(!userId) throw new HttpException("", HttpStatus.UNAUTHORIZED);
    const findUser = await this.usersSqlRepository.findUserById(userId);
    if(!findUser) throw new HttpException("", HttpStatus.UNAUTHORIZED);
    if (findUser) {
      return{
        'email': findUser.email,
        'login': findUser.login,
        'userId': findUser.ID,
      };
    } else {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}