// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { HydratedDocument, Model, Types, Document } from "mongoose";
// import { BlogModelType } from "../blogs/type/blogs.schema";
//
//
// @Schema({
//   _id: false,
//   versionKey: false
// })
// // export class Attempt extends Document {
// export class Attempt {
//
//   _id: Types.ObjectId;
//   @Prop()
//   ip: string;
//   @Prop()
//   url: string;
//   @Prop()
//   time: Date;
//
//   static createAttempt(
//     ip: string,
//     url: string,
//     time: Date,
//
//   ): Attempt {
//
//     const newAttempt = new Attempt();
//
//     newAttempt._id = new Types.ObjectId()
//     newAttempt.ip = ip;
//     newAttempt.url = url;
//     newAttempt.time = time;
//
//     return newAttempt
//   }
// }
//
// export const AttemptSchema = SchemaFactory.createForClass(Attempt);
//
// const attemptStaticMethods: AttemptModelStaticType = {
//   createAttempt: Attempt.createAttempt
// }
// AttemptSchema.statics = attemptStaticMethods
// export type AttemptModelStaticType = {
//   createAttempt: (
//     ip: string,
//     url: string,
//     time: Date
//   ) => Attempt
// }
// export type AttemptDocument = HydratedDocument<Attempt>
// export type AttemptModelType = Model<AttemptDocument> & AttemptModelStaticType