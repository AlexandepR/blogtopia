import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { Type } from "class-transformer";
import { IsLoginOrEmailAlreadyExists, IsLoginOrEmailNotExists } from "../../pipes/validation/validate-user-login.pipe";


export class checkEmailInputClassModel {
  @IsLoginOrEmailNotExists()
  @IsEmail()
  email: string
}
export type codeInputModel = {
  code: string
}
export class codeInputClassModel {
  @IsNotEmpty()
  @IsString()
  code: string
}
export type checkEmailInputModel = {
  email: string
}
export class newPasswordInputModel {
  // @Type()
  @IsNotEmpty()
  recoveryCode: string
  @Length(6,20)
  newPassword: string
}

export class loginInputClassModel {
  // @Type()
  @IsNotEmpty()
  loginOrEmail: string
  // @Type()
  @IsNotEmpty()
  password: string
}
