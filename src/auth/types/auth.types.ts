import { IsEmail, IsNotEmpty, Length } from "class-validator";
import { Type } from "class-transformer";


export class checkEmailInputClassModel {
  @IsEmail()
  email: string
}
export type codeInputModel = {
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
  @Type()
  @IsNotEmpty()
  password: string
}
