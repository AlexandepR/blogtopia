import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { BlogsController } from "./blogs.controller";
import { BlogsService } from "./blogs.service";
import mongoose from "mongoose";

export type BlogType = {
  name: string
}

const blogSchema = new mongoose.Schema<BlogType>({
  name: String
})

@Module({
  imports:[
    MongooseModule.forFeature([{name: Blog.name, schema: blogSchema}]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
})

export class BlogsModule {}