import { configModule } from "./configuration/config.module";
// const configModule = getConfigModule;
import { Module } from "@nestjs/common";
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
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./auth/users.module";
import { AuthController } from "./auth/auth.cotroller";
import { AuthService } from "./auth/auth.service";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { EmailModule } from "./managers/email.module";
import { SecurityService } from "./security/security.service";
import { SecurityRepository } from "./security/security.repository";
import { Security, SecuritySchema } from "./security/type/security.schema";
import { MailerModule } from "@nestjs-modules/mailer";
import {
  CheckConfirmDataPipe, existingBlog, existingBlogPipe,
  IsLoginOrEmailNotExistsPipe
  // validateInputBlogPipe
} from "./pipes/validation/validate.pipe";
import { SecurityController } from "./security/security.controller";

;



@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "swagger-static"),
      serveRoot: settingsEnv.NODE_ENV === "development" ? "/" : "/swagger"
    }),
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 5000,
    }),
    configModule,
    AuthModule,
    UsersModule,
    EmailModule,
    MongooseModule.forRoot(settingsEnv.MONGO_URL,
      // {
    // MongooseModule.forRoot(settingsEnv.MONGO_URL, {
    // MongooseModule.forRoot('mongodb:127.0.0.1:27017', {
    //   dbName: 'blogtopia',
    //   loggerLevel: 'debug',
    // }
    ),
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
    ]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail', // if write 'gmail', settings below not need
        auth: {
          user: settingsEnv.EMAIL_LOG,
          pass: settingsEnv.EMAIL_PASS,
        },
      },
      defaults: {
        from: `"Alex" <${settingsEnv.EMAIL_LOG}>`,
      },
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
    BlogsController,
    PostsController,
    SecurityController,
    CommentsController,
    TestingController,
  ],
  providers: [
    AuthService,
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    UsersService,
    UsersRepository,
    CommentsService,
    CommentsRepository,
    TestingService,
    TestingRepository,
    SecurityService,
    SecurityRepository,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    // IsLoginOrEmailAlreadyExistsPipe,
    IsLoginOrEmailNotExistsPipe,
    CheckConfirmDataPipe,
    existingBlogPipe,
    // validateInputBlogPipe
  ]
})
export class AppModule {
}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(EmailConfirmMiddleware)
//       // .forRoutes('auth/registration');
//       .forRoutes('auth/*');
//   }
// }