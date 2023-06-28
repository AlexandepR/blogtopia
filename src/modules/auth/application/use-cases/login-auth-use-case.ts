import { HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { isPasswordCorrect } from "../../../../utils/helpers";
import { JwtService } from "../jwt.service";
import { UsersRepository } from "../../../users/infrastructure/users.repository";
import { validateOrRejectModel } from "../../../../utils/validation.helpers";
import { loginInputClassModel } from "../../types/auth.types";
import { UsersService } from "../../../users/application/users.service";
import { SecurityService } from "../../../security/application/security.service";
import { UsersSqlRepository } from '../../../users/infrastructure/users.sql-repository';
import { SecuritySqlRepository } from '../../../security/infrastructure/security.sql-repository';

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
    protected jwtService: JwtService,
    protected usersSqlRepository: UsersSqlRepository,
    protected securitySqlRepository: SecuritySqlRepository,
  ) {
  }
  async execute(command: LoginAuthCommand) {
    await validateOrRejectModel(command.signInDto, loginInputClassModel);
    const user = await this.usersSqlRepository.findByLoginOrEmail(command.signInDto.loginOrEmail);
    if(!user || user.banInfo.isBanned) throw new UnauthorizedException()
    if (user) {
      const isHash = await isPasswordCorrect(command.signInDto.password, user.passwordHash);
      if (!user || !user.isConfirmed || !isHash) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      const createSession = await this.securitySqlRepository.createSession(user.ID, command.ip, command.deviceName);
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