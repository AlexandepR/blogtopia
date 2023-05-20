import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { randomUUID } from "crypto";


@Schema()
export class Security {
  _id: Types.ObjectId;
  @Prop()
  issuedDateRefreshToken: string;
  @Prop()
  deviceId: string;
  @Prop()
  userId: Types.ObjectId;
  @Prop()
  // ip: string | string[];
  ip: string[];
  @Prop()
  deviceName: string;
  static createSession (
    userId: Types.ObjectId,
    // ip: string | string[],
    ip: string,
    deviceName: string,
    SecurityModel: SecurityModelType
  ): SecurityDocument {
    const session = new SecurityModel()
    session.issuedDateRefreshToken =new Date().toISOString();;
    session.deviceId = randomUUID();
    session.userId = userId;
    session.ip.push(ip);
    session.deviceName = deviceName

    return session
  }
}

export const SecuritySchema = SchemaFactory.createForClass(Security);
const securityStaticMethods: SecurityModelStaticType = {
  createSession: Security.createSession
};
SecuritySchema.statics = securityStaticMethods
export type SecurityModelStaticType = {
  createSession: (
    userId: Types.ObjectId,
    // ip: string | string[],
    ip: string,
    deviceName: string,
    SecurityModel: SecurityModelType
  ) => Security
}
export type SecurityDocument = HydratedDocument<Security>
export type SecurityModelType = Model<SecurityDocument> & SecurityModelStaticType