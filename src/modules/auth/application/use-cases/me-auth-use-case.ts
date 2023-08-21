import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Request } from "express";
import { UsersOrmRepository } from "../../../users/infrastructure/users.orm-repository";

export class getOwnAccountAuthCommand {
  constructor(
    public req: Request
  ) {
  }
}

@CommandHandler(getOwnAccountAuthCommand)
export class getOwnAccountAuthUseCase implements ICommandHandler<getOwnAccountAuthCommand> {
  constructor(
    protected usersOrmRepository: UsersOrmRepository,
  ) {
  }
  async execute({ req }: getOwnAccountAuthCommand) {
    const userId = req.requestUser.ID;
    if (!userId) throw new HttpException("", HttpStatus.UNAUTHORIZED);
    const findUser = await this.usersOrmRepository.findUserById(userId);
    if (!findUser) throw new HttpException("", HttpStatus.UNAUTHORIZED);
    if (findUser) {
      return {
        "email": findUser.email,
        "login": findUser.login,
        "userId": findUser.ID
      };
    } else {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}