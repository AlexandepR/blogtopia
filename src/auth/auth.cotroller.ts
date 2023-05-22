import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { CreateUserInputClassModel } from "../users/type/usersTypes";
import {
  CheckLoginOrEmailGuard,
  EmailConfirmGuard, recoveryCodeGuard

} from "../middleware/middleware";
import { Throttle } from "@nestjs/throttler";
import {
  checkEmailInputClassModel,
  codeInputModel,
  loginInputClassModel,
  newPasswordInputModel
} from "./types/auth.types";
import { Public, RefreshTokenAuthGuard } from "./decorators/public.decorator";
import { Response } from "express";


@Controller("auth")
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected usersService: UsersService
  ) {
  }
  @Public()
  @Throttle(5, 10)
  @Post("/registration")
  // @UseGuards(
    // EmailConfirmGuard,
    // CheckLoginOrEmailGuard
    // recoveryCodeGuard
  // )
  async registration(
    @Ip() ip,
    @Body() dto: CreateUserInputClassModel
  ) {
    return await this.authService.registration(dto, ip);
  }
  @Public()
  @Throttle(5, 10)
  @Post("/registration-email-resending")
  async emailResending(
    @Body() dto: checkEmailInputClassModel
  ) {
    return await this.authService.emailResend(dto);
  }
  @Public()
  @Throttle(5, 10)
  @Post("/registration-confirmation")
  async confirmRegistration(
    //   @Param('postId')
    //     postId: string,
    @Body() dto:codeInputModel
  ) {
    return await this.authService.confirmRegistration(dto.code);
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
    const userAgent = req.headers["user-agent"];
    const { refreshTokenCookie, token } = await this.authService.login(signInDto, userAgent, ip);
    response.setHeader("Set-Cookie", refreshTokenCookie);
    response.send({ accessToken: token.token });
  }
  @Public()
  @Throttle(5, 10)
  @Post("/password-recovery")
  async passwordRecovery(
    @Body() email: checkEmailInputClassModel
  ) {
    return await this.authService.passwordRecovery(email);
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
    return await this.authService.newPassword(dto);
  }
  @RefreshTokenAuthGuard()
  @Throttle(5, 10)
  @Post("/refresh-token")
  async refreshToken(
    @Res() response: Response,
    @Req() req: Request
  ) {
    const { refreshTokenCookie, token } = await this.authService.refreshToken(req);
    response.setHeader("Set-Cookie", refreshTokenCookie);
    response.send({ accessToken: token.token });
  }
  @RefreshTokenAuthGuard()
  @Throttle(5, 10)
  @Post("/logout")
  async logout(
    @Req() req: Request
  ) {
    return await this.authService.logout(req);
  }
  // @Public()
  @Get("/me")
  async getOwnAccount(
    @Req() req: Request
  ) {
    return await this.authService.getOwnAccount(req);
  }
}