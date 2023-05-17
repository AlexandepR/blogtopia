import { IsEmail } from "class-validator";


export class checkEmailInputClassModel {
  @IsEmail()
  email: string
}

export type checkEmailInputModel = {
  email: string
}


export class loginInputClassModel {
  loginOrEmail: string
  password: string
}
