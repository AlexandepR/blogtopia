import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Post, PostSchema } from "../../posts/type/posts.schema";
import { Comment, CommentSchema } from "../../comments/type/comments.schema";
import { TestingController } from "./testing.controller";
import { TestingService } from "./testing.service";
import { TestingRepository } from "./testing.repository";
import { Security, SecuritySchema } from "../../security/type/security.schema";
import { User, UserSchema } from "../../users/domain/entities/users.schema";
import { Blog, BlogSchema } from "../../blogs/domain/entities/blogs.schema";


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Security.name,
        schema: SecuritySchema,
      },
    ])],
  providers: [
    TestingService,
    TestingRepository,
  ],
  controllers: [TestingController],
})
export class TestingModule{}