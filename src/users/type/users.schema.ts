import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CreateUserInputModelType } from "./usersTypes";

@Schema({
  versionKey: false,
})
export class User {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 10,
    match: /^[a-zA-Z0-9_-]*$/
  })
  login: string;

  @Prop({
    required: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    maxlength: 20
  })
  password: string;

  @Prop()
  createdAt: string;

  static create(userDto: CreateUserInputModelType, UserModel: UserModelType):UserDocument {
    const createUser = new UserModel();
    createUser.login = userDto.login;
    createUser.email = userDto.email;
    createUser.password = userDto.password;
    createUser.createdAt = new Date().toISOString();
    return createUser;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
const userStaticMethods: UserModelStaticType = {
  create: User.create
};
UserSchema.statics = userStaticMethods
export type UserModelStaticType = {
  create:(userDto: CreateUserInputModelType, UserModel: UserModelType) => UserDocument
}
export type UserDocument = HydratedDocument<User>
export type UserModelType = Model<UserDocument> & UserModelStaticType
