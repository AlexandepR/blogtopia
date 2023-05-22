import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { v4 as uuidv4 } from "uuid";
import { UsersService } from "../users/users.service";
import { CreateUserInputClassModel } from "../users/type/usersTypes";
import { validateOrRejectModel } from "../helpers/validation.helpers";
import {
  checkEmailInputClassModel, codeInputClassModel,
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
import { UserDocument } from "../users/type/users.schema";

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
    await validateOrRejectModel(dto, CreateUserInputClassModel);
    const passwordHash = await generateHash(dto.password);
    const confirmEmail = false;
    const findUserByEmail = await this.usersRepository.findByLoginOrEmail(dto.email);
    const findUserByLogin = await this.usersRepository.findByLoginOrEmail(dto.login);
    if (findUserByLogin || findUserByEmail) throw new HttpException('', HttpStatus.BAD_REQUEST);
    const user: UserDocument = await this.usersRepository.createUser(dto, passwordHash, ip, confirmEmail);
    try {
      await this.emailService.sendEmailConfirmationMessage(user);
    } catch (error) {
      await this.usersRepository.deleteUser(user._id);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    throw new HttpException("", HttpStatus.NO_CONTENT);
  }
  async emailResend(dto: checkEmailInputClassModel) {
    await validateOrRejectModel(dto, checkEmailInputClassModel);
    const email = dto.email
    const newCode = uuidv4();
    const findUser = await this.usersRepository.findByLoginOrEmail(email)
    // if (!findUser || findUser.emailConfirmation.isConfirmed === true) throw new BadRequestException()
    const userId = new Types.ObjectId(findUser._id.toString());
    const userUpdateCode = await this.usersRepository.updateConfirmCode(userId, newCode);
    if (!userUpdateCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const sendEmail = await this.emailService.sendEmailConfirmationMessage(userUpdateCode);
    if (sendEmail) {
      throw new HttpException("", HttpStatus.NO_CONTENT);
    } else {
      await this.usersRepository.deleteUser(userId);
      return null;
    }
  }
  async confirmRegistration(dto: codeInputClassModel) {
    await validateOrRejectModel(dto, codeInputClassModel);
    const user = await this.usersService.findByConfirmationCode(dto.code);
    if (!user || user.emailConfirmation.isConfirmed === true) throw new BadRequestException()

    const dateNow = new Date();
    if (user.emailConfirmation.expirationDate.getTime() - dateNow.getTime() <= 0) {
      await this.usersRepository.deleteUser(user._id);
      throw new HttpException("", HttpStatus.BAD_REQUEST);
    }
    if(updateConfirmInfo(user,dto.code)) {
      user.emailConfirmation.isConfirmed = true;
      const createUser = await this.usersRepository.save(user)
      if (createUser) throw new HttpException("", HttpStatus.NO_CONTENT);
    }
    throw new HttpException("", HttpStatus.BAD_REQUEST);
  }
  async login(signInDto: loginInputClassModel,deviceName: string, ip:string) {
    await validateOrRejectModel(signInDto, loginInputClassModel);
    const user = await this.usersService.findUserByLoginOrEmail(signInDto.loginOrEmail);
    if (user) {
      const isHash = await isPasswordCorrect(signInDto.password, user.accountData.passwordHash);
      if (!user || !user.emailConfirmation.isConfirmed || !isHash) throw new HttpException("", HttpStatus.UNAUTHORIZED);
      const createSession = await this.securityService.createSession(user._id, ip, deviceName);
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
  async passwordRecovery(emailDto: checkEmailInputClassModel) {
    await validateOrRejectModel(emailDto, checkEmailInputClassModel);
    const newCode = uuidv4();
    const updatePassRecoveryCode = await this.usersRepository.updatePassRecoveryCode(emailDto.email, newCode);
    if (!updatePassRecoveryCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
    const sendCode = await this.emailService.sendEmailRecoveryPassCode(emailDto.email, newCode);
    if (!sendCode) throw new HttpException("", HttpStatus.BAD_REQUEST);
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
    // const user = req.user
    const userId = await this.jwtService.findUserIdByAuthHeaders(req);
    const user = await this.usersRepository.findUserById(userId)
    const updateRefreshToken = await this.jwtService.updateRefreshToken(refreshToken);
    if (user && updateRefreshToken) {
      await this.securityService.updateDateSession(user._id);
      await this.jwtService.refreshTokenToDeprecated(user, refreshToken);
      const token = await this.jwtService.сreateJWT(user);
      const refreshTokenCookie = `refreshToken=${updateRefreshToken}; HttpOnly; Secure`;
      // const refreshTokenCookie = `refreshToken=${updateRefreshToken}`;
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
    // const userId = req.user!._id.toString();
    const userId = await this.jwtService.findUserIdByAuthHeaders(req);
    const findUser = await this.usersService.findUserById(userId.toString());
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