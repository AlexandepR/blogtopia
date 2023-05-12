import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { Blog, BlogSchema } from "./blogs/type/blogs.schema";
import { Post, PostSchema } from "./posts/type/posts.schema";
import { Comment, CommentSchema } from "./comments/type/comments.schema";
import { User, UserSchema } from "./users/type/users.schema";
import { PostsRepository } from "./posts/posts.repository";
import { BlogsRepository } from "./blogs/blogs.repository";
import { BlogsService } from "./blogs/blogs.service";
import { PostsService } from "./posts/posts.service";
import { UsersController } from "./users/users.controller";
import { BlogsController } from "./blogs/blogs.controller";
import { PostsController } from "./posts/posts.controller";
import { CommentsController } from "./comments/comments.controller";
import { TestingController } from "./test/testing.controller";
import { UsersService } from "./users/users.service";
import { UsersRepository } from "./users/users.repository";
import { CommentsService } from "./comments/comments.service";
import { CommentsRepository } from "./comments/comments.repository";
import { TestingService } from "./test/testing.service";
import { TestingRepository } from "./test/testing.repository";
import { settingsEnv } from "./settings/settings";


@Module({
  imports: [
    // MongooseModule.forRoot(settingsEnv.MONGO_URL),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "swagger-static"),
      serveRoot: process.env.NODE_ENV === "development" ? "/" : "/swagger"
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(settingsEnv.MONGO_URL, {
    // MongooseModule.forRoot(settingsEnv.MONGO_URL, {
    // MongooseModule.forRoot('mongodb:127.0.0.1:27017', {
    //   dbName: 'blogtopia',
    //   loggerLevel: 'debug',
    }),
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
    ])
  ],
  controllers: [
    AppController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    TestingController,
  ],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    UsersService,
    UsersRepository,
    CommentsService,
    CommentsRepository,
    TestingService,
    TestingRepository
  ]
})
export class AppModule {
}
