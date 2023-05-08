// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { HydratedDocument, Types } from "mongoose";
//
//
// @Schema()
// export class Post {
//   @Prop({
//     required:true,
//     type: mongoose.Schema.Types.ObjectId
//   })
//   _id: Types.ObjectId;
//
//   @Prop({
//     required: true,
//   })
//   name: string;
//
//   @Prop()
//   age: number;
//
//   @Prop({
//     default: []
//   })
//   bread: string
//
//   @Prop({
//     default: [],
//     type: [PostSchema]
//   })
//   comments: Posts[]
//
//   setAge(newAge: number) {
//     if (newAge <= 0) throw new Error('Bade age')
//     this.age = newAge
//   }
//   static createSuperPost() {
//     const createdPost = new this.postModel(createPostDto)
//     return 'static------'
//   }
// }
//
// export const BlogSchema = SchemaFactory.createForClass(Post);
// BlogSchema.methods = {
//   setAge: Post.prototype.setAge
// }
// export type SuperPostStaticType = {
//   createSuperPost: () => string
// }
// export type PostDocument = HydratedDocument<Post>;