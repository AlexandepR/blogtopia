import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Model, Types, ObjectId } from "mongoose";
import { CreateBlogInputModelType } from "./blogsType";
// import ObjectId = module


// @Schema()
// export class Posts {
//   @Prop({
//     required: true
//   })
//   namePost: string;
//
//   @Prop()
//   countPost: number;
//
//   @Prop({
//     default: []
//   })
//   comment: string;
// }
//
// export const PostSchema = SchemaFactory.createForClass(Posts);
const { ObjectId } = mongoose.Types;

@Schema()
export class Blog {
  // @Prop({
  //   required:true,
  //   type: mongoose.Schema.Types.ObjectId
  // })
  _id: Types.ObjectId;

  @Prop({
    required: true
  })
  name: string;

  @Prop({
    require: true
  })
  description: string;

  @Prop
  ({
    require: true
    // default: []
  })
  websiteUrl: string;

  @Prop()
  createdAt: string;

  @Prop()
  isMembership: boolean;
  // @Prop({
  //   default: [],
  //   type: [PostSchema]
  // })
  // comments: Posts[]
  // setAge(newAge: number) {
  //   if (newAge <= 0) throw new Error("Bade age");
  //   this.age = newAge;
  // }
  // static createSuperBlog(dto: any, BlogModel: BlogModelType): BlogDocument {
  //   const createdBlog = new BlogModel(dto);
  //   createdBlog.setAge(100);
  //   return createdBlog;
  // }
  static createStaticBlog(dto: CreateBlogInputModelType, BlogModel: BlogModelType): BlogDocument {
    if (!dto) throw new Error("Bad request");
    const createNewBlog = new BlogModel();

    createNewBlog.name = dto.name;
    createNewBlog.description = dto.description;
    createNewBlog.websiteUrl = dto.websiteUrl;
    createNewBlog.createdAt = new Date().toISOString();

    return createNewBlog;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  // createBlog: Blog.prototype.createBlog
  // setAge: Blog.prototype.setAge
};
const blogStaticMethods: BlogModelStaticType = {
  createStaticBlog: Blog.createStaticBlog
};
BlogSchema.statics = blogStaticMethods;

export type BlogModelStaticType = {
  createStaticBlog: (dto: CreateBlogInputModelType, BlogModel: BlogModelType) => BlogDocument
}

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType