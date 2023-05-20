import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { v4 as uuidv4 } from "uuid";
import { UsersService } from "../users/users.service";
import { CreateUserInputClassModel } from "../users/type/usersTypes";
import { validateOrRejectModel } from "../helpers/validation.helpers";
import {
  checkEmailInputClassModel,
  codeInputModel,
  loginInputClassModel,
  newPasswordInputModel
} from "./types/auth.types";
import { Types } from "mongoose";
import { EmailService } from "../managers/email.service";
import { generateHash, isPasswordCorrect, updateConfirmInfo } from "../utils/helpers";
import { SecurityService } from "../security/security.service";
import { JwtService } from "./jwt.service";
import { Request } from "express";
import { settingsEnv } from "../settings/settings";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(
    protected jwtService: JwtService,
    protected usersService: UsersService,
    protected emailService: EmailService,
    protected usersRepository: UsersRepository,
    protected securityService: SecurityService,
  ) {
  }
  async registration(dto: CreateUserInputClassModel, ip: string) {
    // const login = dto.login;
    // const email = dto.email;
    // const recoveryCode = dto.recoveryCode
    // if (email || login) {
    //   const findUserEmail = await this.usersService.findUserByLoginOrEmail(email);
    //   const findUserLogin = await this.usersService.findUserByLoginOrEmail(login);
    //   if (findUserEmail || findUserLogin ||
    //     findUserLogin.emailConfirmation.isConfirmed === true) {
    //     throw new HttpException('', HttpStatus.FORBIDDEN);
    //   }
    // }
    await validateOrRejectModel(dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(dto.password);
    const confirmEmail = false;
    const user = await this.usersRepository.createUser(dto, passwordHash, ip, confirmEmail);
    try {
      this.emailService.sendEmailConfirmationMessage(user);
    } catch (error) {
      await this.usersRepository.deleteUser(user._id);
      return null;
    }
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
  async emailResend(dto: checkEmailInputClassModel) {
    const email = dto.email
    const newCode = uuidv4();
    await validateOrRejectModel(dto, checkEmailInputClassModel);
    const findEmail = await this.usersRepository.findByLoginOrEmail(email)
    if (findEmail.emailConfirmation.isConfirmed === true || !findEmail) throw new HttpException("", HttpStatus.FORBIDDEN);
    const userId = new Types.ObjectId(findEmail._id.toString());
    const userUpdateCode = await this.usersRepository.updateConfirmCode(userId, newCode);
    if (!userUpdateCode) throw new HttpException("", HttpStatus.FORBIDDEN);
    const sendEmail = await this.emailService.sendEmailConfirmationMessage(userUpdateCode);
    if (sendEmail) {
      throw new HttpException("", HttpStatus.NO_CONTENT);
    } else {
      await this.usersRepository.deleteUser(userId);
      return null;
    }
  }
  async confirmRegistration(code: string) {
    const user = await this.usersService.findByConfirmationCode(code);
    if (!user || user.emailConfirmation.isConfirmed) throw new HttpException("", HttpStatus.FORBIDDEN);

    const dateNow = new Date();
    if (user.emailConfirmation.expirationDate.getTime() - dateNow.getTime() <= 0) {
      await this.usersRepository.deleteUser(user._id);
      throw new HttpException("", HttpStatus.FORBIDDEN);
    }
    if(updateConfirmInfo(user,code)) {
      user.emailConfirmation.isConfirmed = true;
      const createUser = await this.usersRepository.save(user)
      if (createUser) throw new HttpException("", HttpStatus.NO_CONTENT);
    }
    throw new HttpException("", HttpStatus.BAD_REQUEST);
  }
  async login(signInDto: loginInputClassModel,deviceName: string, ip:string) {
    await validateOrRejectModel(signInDto, loginInputClassModel);
    const user = await this.usersService.findUserByLoginOrEmail(signInDto.loginOrEmail);
    const isHash = isPasswordCorrect(signInDto.password, user.accountData.passwordHash);
    if (!user || !user.emailConfirmation.isConfirmed || !isHash) throw new HttpException("", HttpStatus.FORBIDDEN);
    const createSession = await this.securityService.createSession(user._id, ip, deviceName);
    if (!createSession) throw new HttpException("", HttpStatus.FORBIDDEN);

      const token = await this.jwtService.сreateJWT(user);
      const refreshToken = await this.jwtService.createRefreshToken(user, createSession.deviceId);
      // const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Secure`;
      const refreshTokenCookie = `refreshToken=${refreshToken}`;
    return { refreshTokenCookie, token };
  }
  async passwordRecovery(emailDto: checkEmailInputClassModel) {
    await validateOrRejectModel(emailDto, checkEmailInputClassModel);
    const emailDtoInput = new checkEmailInputClassModel()
    // const email = emailDtoInput as unknown as string
    const newCode = uuidv4();
    const updatePassRecoveryCode = await this.usersRepository.updatePassRecoveryCode(emailDto.email, newCode);
    if (!updatePassRecoveryCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const sendCode = await this.emailService.sendEmailRecoveryPassCode(emailDto.email, newCode);
    if (!sendCode) throw new HttpException("", HttpStatus.FORBIDDEN);
    else throw new HttpException('', HttpStatus.NO_CONTENT)
  }
  async newPassword(dto: newPasswordInputModel) {
    await validateOrRejectModel(dto, newPasswordInputModel);
    const code = dto.recoveryCode
    const test = dto.newPassword
    const checkCode = await this.usersRepository.checkRecoveryCode(code);
    if(!checkCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const passHash = await generateHash(dto.newPassword);
    const updateHash = await this.usersRepository.updatePassHash(code, passHash)
    if (!updateHash || !checkCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const deleteCode = await this.usersRepository.deleteRecoveryCode(code)
     if (deleteCode)throw new HttpException("", HttpStatus.NO_CONTENT);
  }
  async refreshToken(req: Request) {
    const refreshToken = req.cookies.refreshToken;
    const user = req.user
    // const getRefreshToken: any = this.jwtService.getSessionInfoByRefreshToken(refreshToken);
    // const user = await this.usersRepository.findUserById(new Types.ObjectId(getRefreshToken.userId));
    // if (!getRefreshToken || !user) throw new HttpException("", HttpStatus.BAD_REQUEST);
    // for (const token of user.authData.expirationRefreshToken) {
    //   if (token === refreshToken) throw new HttpException("", HttpStatus.UNAUTHORIZED);}
    // req.user = user;
    const updateRefreshToken = await this.jwtService.updateRefreshToken(refreshToken);
    // const findUser = await this.jwtService.getUserByRefreshToken(refreshToken);
    if (user && updateRefreshToken) {
      await this.securityService.updateDateSession(user._id);
      await this.jwtService.refreshTokenToDeprecated(user, refreshToken);
      const token = await this.jwtService.сreateJWT(user);
      // const refreshTokenCookie = `refreshToken=${updateRefreshToken}; HttpOnly; Secure`;
      const refreshTokenCookie = `refreshToken=${updateRefreshToken}`;
      return { refreshTokenCookie, token };
    }
    throw new HttpException("", HttpStatus.BAD_REQUEST);
  }
  async logout(req: Request) {
    const refreshToken = req.cookies.refreshToken;
    const findUser = await this.jwtService.getUserByRefreshToken(refreshToken);
    const getRefreshToken: any = jwt.verify(refreshToken, settingsEnv.JWT_REFRESH_TOKEN_SECRET);
    const terminateSessions = await this.securityService.terminateSessionByDeviceId(getRefreshToken.deviceId);
    if (findUser && terminateSessions) {
      const expiredRefreshToken = await this.jwtService.refreshTokenToDeprecated(findUser, refreshToken);
      if (!expiredRefreshToken) {
        throw new HttpException("", HttpStatus.NO_CONTENT);
      }
    } else {
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
  }
  async getOwnAccount(req: Request) {
    const userId = req.user!._id.toString();
    const findUser = await this.usersService.findUserById(userId);
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