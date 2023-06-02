import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserInputClassModel } from "../../../users/type/usersTypes";
import { generateHash, isPasswordCorrect } from "../../../../utils/helpers";
import { JwtService } from "../jwt.service";
import { EmailService } from "../../../mail/application/managers/email.service";
import { UsersRepository } from "../../../users/application/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { UserDocument } from "../../../users/type/users.schema";
import { loginInputClassModel, newPasswordInputModel } from "../../types/auth.types";
import { UsersService } from "../../../users/application/users.service";
import { SecurityService } from "../../../security/application/security.service";

export class LoginAuthCommand {
  constructor(
    public signInDto: loginInputClassModel,
    public deviceName: string,
    public ip: any,
  ) {}
}

@CommandHandler(LoginAuthCommand)
export class LoginAuthUseCase implements ICommandHandler<LoginAuthCommand>{
  constructor(
    protected usersRepository: UsersRepository,
    protected jwtService: JwtService,
    protected usersService: UsersService,
    protected securityService: SecurityService,
  ) {
  }
  async execute(command: LoginAuthCommand) {
    await validateOrRejectModel(command.signInDto, loginInputClassModel);
    const user = await this.usersService.findUserByLoginOrEmail(command.signInDto.loginOrEmail);
    if(!user || user.accountData.banInfo.isBanned) throw new UnauthorizedException()
    if (user) {
      const isHash = await isPasswordCorrect(command.signInDto.password, user.accountData.passwordHash);
      if (!user || !user.emailConfirmation.isConfirmed || !isHash) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      const createSession = await this.securityService.createSession(user._id, command.ip, command.deviceName);
      if (!createSession) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      const token = await this.jwtService.сreateJWT(user);
      const refreshToken = await this.jwtService.createRefreshToken(user, createSession.deviceId);
      const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Secure`;
      // const refreshTokenCookie = `refreshToken=${refreshToken}`;
      if (!token || !refreshToken || !refreshTokenCookie) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      return { refreshTokenCookie, token };
    }
    throw new HttpException("", HttpStatus.UNAUTHORIZED);
  }
}