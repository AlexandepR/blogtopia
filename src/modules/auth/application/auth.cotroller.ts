import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { CreateUserInputClassModel } from "../../users/type/usersTypes";
import { recoveryCodeGuard } from "../../../middleware/middleware";
import { Throttle } from "@nestjs/throttler";
import {
  checkEmailInputClassModel,
  codeInputClassModel,
  loginInputClassModel,
  newPasswordInputModel
} from "../types/auth.types";
import { Public, RefreshTokenAuthGuard } from "../../../utils/public.decorator";
import { CommandBus } from "@nestjs/cqrs";
import { RegistrationAuthCommand } from "./use-cases/registration-auth-use-case";
import { NewPasswordAuthCommand } from "./use-cases/newPassword-auth-use-case";
import { LoginAuthCommand } from "./use-cases/login-auth-use-case";
import { RefreshTokenAuthCommand } from "./use-cases/refreshToken-auth-use-case";
import { ConfirmRegistrationAuthCommand } from "./use-cases/registrationConfirmation-auth-use-case";
import { PasswordRecoveryAuthCommand } from "./use-cases/passwordRecovery-auth-use-case";
import { RegistrationEmailResendAuthCommand } from "./use-cases/registrationEmailResending-auth-use-case";
import { LogoutAuthCommand } from "./use-cases/logout-auth-use-case";


// @UseGuards(CheckLoginOrEmailGuard)
// @UserFromRequestDecorator()user:UserDocument,

@Controller("auth")
export class AuthController {
  constructor(
    private commandBus: CommandBus,
  ) {
  }
  @Public()
  @Throttle(5, 10)
  @Post("/registration")
  async registration(
    @Ip() ip,
    @Body() dto: CreateUserInputClassModel
  ) {
    const command = new RegistrationAuthCommand(dto, ip);
    return await this.commandBus.execute(command);
  }
  @Public()
  @Throttle(5, 10)
  @Post("/registration-email-resending")
  async emailResending(
    @Body() dto: checkEmailInputClassModel
  ) {
    const command = new RegistrationEmailResendAuthCommand(dto);
    return await this.commandBus.execute(command);
    // return await this.authService.emailResend(dto);
  }
  @Public()
  // @UseGuards(recoveryCodeGuard)
  @Throttle(5, 10)
  @Post("/registration-confirmation")
  async confirmRegistration(
    //   @Param('postId')
    //     postId: string,
    @Body() dto:codeInputClassModel
  ) {
    const command = new ConfirmRegistrationAuthCommand(dto);
    return await this.commandBus.execute(command);
    // return await this.authService.confirmRegistration(dto);
  }

  @Public()
  @Throttle(5, 10)
  @HttpCode(HttpStatus.OK)
  @Post("/login")
  async login(
    @Ip() ip,
    @Req() req: Request,
    @Res() response: Response,
    @Body() signInDto: loginInputClassModel
  ) {
    const deviceName = req.headers["user-agent"];
    // const { refreshTokenCookie, token } = await this.authService.login(signInDto, userAgent, ip);
    const command = new LoginAuthCommand(signInDto, deviceName, ip);
    const { refreshTokenCookie, token } = await this.commandBus.execute(command);
    response.setHeader("Set-Cookie", refreshTokenCookie);
    response.send({ accessToken: token.token });
  }
  @Public()
  @Throttle(5, 10)
  @Post("/password-recovery")
  async passwordRecovery(
    @Body() dto: checkEmailInputClassModel
  ) {
    const command = new PasswordRecoveryAuthCommand(dto)
    return await this.commandBus.execute(command);
    // return await this.authService.passwordRecovery(email);
  }
  @Public()
  @UseGuards(
    recoveryCodeGuard
  )
  @Throttle(5, 10)
  @Post("/new-password")
  async newPassword(
    @Body() dto: newPasswordInputModel
  ) {
    const command = new NewPasswordAuthCommand(dto);
    return await this.commandBus.execute(command);
  }
  @HttpCode(HttpStatus.OK)
  @Throttle(5, 10)
  @RefreshTokenAuthGuard()
  @Post("/refresh-token")
  async refreshToken(
    @Res() response: Response,
    @Req() req: Request
  ) {
    // const { refreshTokenCookie, token } = await this.authService.refreshToken(req);
    const command = new RefreshTokenAuthCommand(req);
    const { refreshTokenCookie, token } = await this.commandBus.execute(command);
    response.setHeader("Set-Cookie", refreshTokenCookie);
    response.send({ accessToken: token.token });
  }
  @Throttle(5, 10)
  @RefreshTokenAuthGuard()
  @Post("/logout")
  async logout(
    @Req() req: Request
  ) {
    const command = new LogoutAuthCommand(req)
    return await this.commandBus.execute(command);
  }
  // @RefreshTokenAuthGuard()
  @Get("/me")
  async getOwnAccount(
    @Req() req: Request
  ) {
    const command = new LogoutAuthCommand(req)
    return await this.commandBus.execute(command);
  }
}