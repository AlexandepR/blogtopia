import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from "mongoose";



@Schema()
export class Posts {
  @Prop({
    required: true,
  })
  namePost: string;

  @Prop()
  countPost: number;

  @Prop({
    default: []
  })
  comment: string;
}
export const PostSchema = SchemaFactory.createForClass(Posts);


@Schema()
export class Blog {
  // @Prop({
  //   required:true,
  //   type: mongoose.Schema.Types.ObjectId
  // })
  _id: Types.ObjectId;

  @Prop({
    required: true,
  })
  name: string;

  @Prop()
  age: number;

  @Prop({
    default: []
  })
  bread: string

  @Prop({
    default: [],
    type: [PostSchema]
  })
  comments: Posts[]

  setAge(newAge: number) {
    if (newAge <= 0) throw new Error('Bade age')
    this.age = newAge
  }
  static createSuperBlog(dto: any, BlogModel: BlogModelType):BlogDocument {
    const createdBlog = new BlogModel(dto)
    createdBlog.setAge(100)
    return createdBlog
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  setAge: Blog.prototype.setAge
}
const blogStaticMethods: BlogModelStaticType = {
  createSuperBlog: Blog.createSuperBlog
}
BlogSchema.statics = blogStaticMethods

export type BlogModelStaticType = {
  createSuperBlog: (name: string, blogModel: BlogModelType) => BlogDocument
}

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & BlogModelStaticType