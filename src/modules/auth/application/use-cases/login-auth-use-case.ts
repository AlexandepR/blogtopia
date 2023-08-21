import { HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { isPasswordCorrect } from "../../../../utils/helpers";
import { JwtService } from "../jwt.service";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { loginInputClassModel } from "../../types/auth.types";
import { UsersOrmRepository } from "../../../users/infrastructure/users.orm-repository";
import { SecurityOrmRepository } from "../../../security/infrastructure/security.orm-repository";

export class LoginAuthCommand {
  constructor(
    public signInDto: loginInputClassModel,
    public deviceName: string,
    public ip: any
  ) {
  }
}

@CommandHandler(LoginAuthCommand)
export class LoginAuthUseCase implements ICommandHandler<LoginAuthCommand> {
  constructor(
    protected jwtService: JwtService,
    protected securityOrmRepository: SecurityOrmRepository,
    protected usersOrmRepository: UsersOrmRepository
  ) {
  }
  async execute({ signInDto, ip, deviceName, signInDto: { loginOrEmail, password } }: LoginAuthCommand) {
    await validateOrRejectModel(signInDto, loginInputClassModel);
    const user = await this.usersOrmRepository.findByLoginOrEmail(loginOrEmail);
    if (!user || user.banInfo.isBanned) throw new UnauthorizedException();
    if (user) {
      const isHash = await isPasswordCorrect(password, user.passwordHash);
      if (!user || !user.isConfirmed || !isHash) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      const createSession = await this.securityOrmRepository.createSession(user.ID, ip, deviceName);
      if (!createSession) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      const token = await this.jwtService.createJWT(user);
      const refreshToken = await this.jwtService.createRefreshToken(user, createSession.deviceId);
      const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Secure`;
      // const refreshTokenCookie = `refreshToken=${refreshToken}`;
      if (!token || !refreshToken || !refreshTokenCookie) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      return { refreshTokenCookie, token };
    }
    throw new HttpException("", HttpStatus.UNAUTHORIZED);
  }
}