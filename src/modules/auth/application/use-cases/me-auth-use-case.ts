import { HttpException, HttpStatus } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "../jwt.service";
import { SecurityService } from "../../../security/application/security.service";
import { Request } from "express";
import { UsersRepository } from "../../../users/application/users.repository";

export class getOwnAccountAuthCommand {
  constructor(
    public req: Request
  ) {
  }
}
@CommandHandler(getOwnAccountAuthCommand)
export class getOwnAccountAuthUseCase implements ICommandHandler<getOwnAccountAuthCommand> {
  constructor(
    protected usersRepository: UsersRepository
  ) {
  }
  async execute(command: getOwnAccountAuthCommand) {
    const userId = command.req.requestUser._id;
    if(!userId) throw new HttpException("", HttpStatus.UNAUTHORIZED);
    // const userId = await this.jwtService.findUserIdByAuthHeaders(req);
    const findUser = await this.usersRepository.findUserById(userId);
    if(!findUser) throw new HttpException("", HttpStatus.UNAUTHORIZED);
    if (findUser) {
      return{
        'email': findUser.accountData.email,
        'login': findUser.accountData.login,
        'userId': findUser._id.toString(),
      };
    } else {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
}