import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreateUserInputModelType, InfoBanStatusClassModel } from "./usersTypes";
import { v4 as uuidv4 } from "uuid";
import { add } from "date-fns";
import { Blog, BlogSchema } from "../../blogs/type/blogs.schema";


@Schema({
  _id: false,
  versionKey: false
})
export class BanInfo {
  @Prop()
  isBanned: boolean;
  @Prop()
  banDate: Date;
  @Prop()
  banReason: string
}

@Schema({
  _id: false,
  versionKey: false
})
class UserAccount {
  @Prop()
  login: string;
  @Prop()
  email: string;
  @Prop()
  passwordHash: string;
  @Prop()
  createdAt:string;
  @Prop({type: BanInfo})
  banInfo: BanInfo
}
@Schema({
  _id: false,
  versionKey: false
})
class EmailConfirmation {
  @Prop()
  confirmationCode: string;
  @Prop()
  expirationDate: Date;
  @Prop()
  isConfirmed: boolean;
  @Prop()
  passwordRecoveryCode: string;
  // @Prop({type: SendDate})
  @Prop()
  sendEmails: Date[]
}
@Schema({
  _id: false,
  versionKey: false
})
class RegistrationData {
  @Prop()
  ip: string[]
  // @Prop({type: DateIp})
  @Prop()
  infoDateIp: Date[]
}
@Schema({
  _id: false,
  versionKey: false
})
class AuthData {
  @Prop()
  expirationRefreshToken: string[]
}
@Schema({
  _id: false,
  versionKey: false
})
class AuthDevicesSessions {
  @Prop()
  ip: string[]
  @Prop()
  deviceId: string[]
  @Prop()
  title: string[]
  @Prop()
  lastActiveDate: string[]
  @Prop()
  expirationTokenDate: string[]
}

@Schema({
  versionKey: false
})
export class User {
  _id: Types.ObjectId;
  @Prop({ type: UserAccount })
  accountData: UserAccount;
  @Prop({ type: EmailConfirmation })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: RegistrationData })
  registrationData: RegistrationData;
  @Prop({ type: AuthData })
  authData: AuthData;
  @Prop({ type: AuthDevicesSessions })
  authDevicesSessions: AuthDevicesSessions;

  banUser(dto: InfoBanStatusClassModel) {
    this.accountData.banInfo.banReason = dto.banReason
    this.accountData.banInfo.banDate = new Date()
    this.accountData.banInfo.isBanned = dto.isBanned
  }
  unBanUser() {
    this.accountData.banInfo.banReason = null
    this.accountData.banInfo.banDate = null
    this.accountData.banInfo.isBanned = false
  }
  static create(
    userDto: CreateUserInputModelType,
    UserModel: UserModelType,
    passwordHash: string,
    ip: any,
    confirmEmail: boolean,
  ): UserDocument {
    const user = new UserModel();
    user.accountData = new UserAccount();
    user.emailConfirmation = new EmailConfirmation()
    user.registrationData = new RegistrationData()
    user.authData = new AuthData()
    user.authDevicesSessions = new AuthDevicesSessions()

    user.accountData.login = userDto.login
    user.accountData.email = userDto.email;
    user.accountData.passwordHash = passwordHash;
    user.accountData.createdAt = new Date().toISOString();
    user.accountData.banInfo = {isBanned: false, banDate: null,banReason: null};
    user.emailConfirmation.confirmationCode = uuidv4();
    user.emailConfirmation.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3
    });
    user.emailConfirmation.isConfirmed = confirmEmail;
    user.emailConfirmation.passwordRecoveryCode = '';
    user.registrationData.ip = [ip]
    user.registrationData.infoDateIp = [];
    user.authData.expirationRefreshToken = [];
    user.authDevicesSessions.ip = []
    user.authDevicesSessions.deviceId = []
    user.authDevicesSessions.title = []
    user.authDevicesSessions.lastActiveDate = []
    user.authDevicesSessions.expirationTokenDate = []

    return user;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  banUser: User.prototype.banUser,
  unBanUser: User.prototype.unBanUser,
};
const userStaticMethods: UserModelStaticType = {
  create: User.create
};
UserSchema.statics = userStaticMethods
export type UserModelStaticType = {
  create: (
    userDto: CreateUserInputModelType,
    UserModel: UserModelType,
    passwordHash: string,
    ip: any,
    confirmEmail: boolean
  ) => UserDocument
}
export type UserDocument = HydratedDocument<User>
export type UserModelType = Model<UserDocument> & UserModelStaticType
