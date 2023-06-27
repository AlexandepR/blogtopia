import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { CheckConfirmData, IsLoginOrEmailNotExists } from '../../../pipes/validation/validate.pipe';


export class checkEmailInputClassModel {
  @IsLoginOrEmailNotExists()
  @IsEmail()
  email: string
}
export type codeInputModel = {
  code: string
}
export class codeInputClassModel {
  @CheckConfirmData()
  @IsNotEmpty()
  @IsString()
  code: string
}
export class newPasswordInputModel {
  @Length(6,20)
  newPassword: string
  @IsNotEmpty()
  recoveryCode: string
}

export class loginInputClassModel {
  @IsNotEmpty()
  loginOrEmail: string
  @IsNotEmpty()
  password: string
}
