import { GetBlogsByAdminUseCase } from "./modules/blogs/application/use-cases/admin/get-blogs.use-case";
import {
  BindUserToBlogByAdminUseCase
} from "./modules/blogs/application/use-cases/admin/bind-user-to-blog.use-case";
import {
  DeleteAllUsersByAdminUseCase
} from "./modules/users/application/use-cases/admin/delete-all.use-case";
import {
  UpdateBanInfoByAdminUseCase
} from "./modules/users/application/use-cases/admin/update-ban-status.use-case";
import { DeleteUserByAdminUseCase } from "./modules/users/application/use-cases/admin/delete-user.use-case";
import { GetUsersByAdminUseCase } from "./modules/users/application/use-cases/admin/get-users.use-case";
import { CreateUserByAdminUseCase } from "./modules/users/application/use-cases/admin/create-user.use-case";
import { GetPostsByBlogUseCase } from "./modules/blogs/application/use-cases/public/getPostsByblogs-public-use-case";
import { GetBlogUseCase } from "./modules/blogs/application/use-cases/public/getBlog-blog-public-use-case";
import { GetBlogsByBloggerUseCase } from "./modules/blogs/application/use-cases/authUser/getBlogs-blogger-use-case";
import {
  GetBlogByIdByBloggerUseCase
} from "./modules/blogs/application/use-cases/authUser/getBlogById-blogger-use-case";
import {
  GetAllCommentsForBloggerUseCase
} from "./modules/blogs/application/use-cases/authUser/getAllCommentsForAllPosts-blogger-use-case";
import {
  CreateBlogByBloggerUseCase
} from "./modules/blogs/application/use-cases/authUser/create-blog-blogger-use-case";
import {
  CreatePostByBlogByBloggerUseCase
} from "./modules/blogs/application/use-cases/authUser/createPostForBlog-blogger-use-case";
import { UpdateBlogByBloggerUseCase } from "./modules/blogs/application/use-cases/authUser/updateBlog-blogger-use-case";
import {
  UpdatePostByBlogByBloggerUseCase
} from "./modules/blogs/application/use-cases/authUser/updatePostByBlog-blogger-use-case";
import { DeleteBlogByBloggerUseCase } from "./modules/blogs/application/use-cases/authUser/deleteBlog-blogger-use-case";
import {
  DeletePostByBlogByBloggerUseCase
} from "./modules/blogs/application/use-cases/authUser/deletePostByBlog-blogger-use-case";
import { LoginAuthUseCase } from "./modules/auth/application/use-cases/login-auth-use-case";
import { LogoutAuthUseCase } from "./modules/auth/application/use-cases/logout-auth-use-case";
import { NewPasswordAuthUseCase } from "./modules/auth/application/use-cases/newPassword-auth-use-case";
import { PasswordRecoveryAuthUseCase } from "./modules/auth/application/use-cases/passwordRecovery-auth-use-case";
import { RegistrationAuthUseCase } from "./modules/auth/application/use-cases/registration-auth-use-case";
import {
  RegistrationEmailResendAuthUseCase
} from "./modules/auth/application/use-cases/registrationEmailResending-auth-use-case";
import { getOwnAccountAuthUseCase } from "./modules/auth/application/use-cases/me-auth-use-case";
import {
  ConfirmRegistrationAuthUseCase
} from "./modules/auth/application/use-cases/registrationConfirmation-auth-use-case";
import { RefreshTokenAuthUseCase } from "./modules/auth/application/use-cases/refreshToken-auth-use-case";
import { GetCommentUseCase } from "./modules/comments/application/use-cases/get-comments.use-case";
import { UpdateCommentUseCase } from "./modules/comments/application/use-cases/update-comment.use-case";
import {
  UpdateOmmentLikeStatusUseCase
} from "./modules/comments/application/use-cases/update-сomment-like-status.use-case";
import { DeleteCommentUseCase } from "./modules/comments/application/use-cases/delete-comment.use-case";
import { GetPostsUseCase } from "./modules/posts/application/use-cases/get-posts.use-case";
import { GetPostByIdUseCase } from "./modules/posts/application/use-cases/get-post-by-id.use-case";
import { GetCommentsByPostUseCase } from "./modules/posts/application/use-cases/get-comments-by-post.use-case";
import { UpdatePostUseCase } from "./modules/posts/application/use-cases/update-post.use-case";
import { UpdatePostLikeStatusUseCase } from "./modules/posts/application/use-cases/update-post-like-status.use-case";
import { CreatePostUseCase } from "./modules/posts/application/use-cases/create-post.use-case";
import { CreateCommentForPostUseCase } from "./modules/posts/application/use-cases/create-comment-for-post.use-case";
import { DeleteAllPostsUseCase } from "./modules/posts/application/use-cases/delete-all-post.use-case";
import { DeleteAllDevicesUseCase } from "./modules/security/application/use-cases/delete-all-devices.use-case";
import { DeleteDeviceByIdUseCase } from "./modules/security/application/use-cases/delete-devices-by-Id.use-case";
import { GetDevicesUseCase } from "./modules/security/application/use-cases/get-devices.use-case";
import { AuthGuard } from "./guards/auth-guard/auth.guard";
import { JwtService } from "./modules/auth/application/jwt.service";
import { BasicAuthGuard } from "./guards/auth-guard/basic.auth.guard";
import { CheckLoginOrEmailGuard, EmailConfirmGuard, recoveryCodeGuard } from "./middleware/middleware";
import { EmailService } from "./modules/mail/application/managers/email.service";
import { EmailAdapter } from "./modules/mail/application/managers/email.adapter";
import { AuthService } from "./modules/auth/application/auth.service";
import { PostsService } from "./modules/posts/application/posts.service";
import { UsersService } from "./modules/users/application/users.service";
import { TestingService } from "./modules/test/application/testing.service";
import { SecurityService } from "./modules/security/application/security.service";
import { CommentsService } from "./modules/comments/application/comments.service";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { CheckConfirmDataPipe, existingBlogPipe, IsLoginOrEmailNotExistsPipe } from "./pipes/validation/validate.pipe";
import { UsersAdminController } from "./modules/users/api/admin.api.user.controller";
import { AuthController } from "./modules/auth/application/auth.cotroller";
import { UsersController } from "./modules/users/application/users.controller";
import { BlogsController } from "./modules/blogs/api/admin.api.blog.controller";
import { BlogsBloggerController } from "./modules/blogs/api/auth.api.blog.controller";
import { BlogsPublicController } from "./modules/blogs/api/public.api.blog.controller";
import { PostsController } from "./modules/posts/application/posts.controller";
import { SecurityController } from "./modules/security/application/security.controller";
import { CommentsController } from "./modules/comments/application/comments.controller";
import { TestingController } from "./modules/test/application/testing.controller";
import { BlogsRepository } from "./modules/blogs/infrastructure/blogs.repository";
import { PostsRepository } from "./modules/posts/application/posts.repository";
import { UsersRepository } from "./modules/users/infrastructure/users.repository";
import { CommentsRepository } from "./modules/comments/application/comments.repository";
import { TestingRepository } from "./modules/test/application/testing.repository";
import { SecurityRepository } from "./modules/security/infrastructure/security.repository";
import { GetBlogsPublicUseCase } from "./modules/blogs/application/use-cases/public/get-blogs-public-use-case";
import { Blog, BlogSchema } from "./modules/blogs/domain/entities/blogs.schema";
import { Post, PostSchema } from "./modules/posts/type/posts.schema";
import { Comment, CommentSchema } from "./modules/comments/type/comments.schema";
import { User, UserSchema } from "./modules/users/domain/entities/users.schema";
import { Security, SecuritySchema } from "./modules/security/type/security.schema";
import { CqrsModule } from "@nestjs/cqrs";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { settingsEnv } from "./settings/settings";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { MailerModule } from "@nestjs-modules/mailer";
import {
  UpdateBanStatusUseCase
} from "./modules/users/application/use-cases/authUser/update-ban-status-blog.use-case";
import {
  UpdateBanInfoBlogUseCase
} from "./modules/blogs/application/use-cases/admin/update-ban-info.use-case";
import {
  getBannedUsersForBlogUseCase
} from "./modules/users/application/use-cases/authUser/get-ban-users-forBlog.use-case";
import { UsersBloggerController } from "./modules/users/api/auth.api.user.controller";
import { BlogsQueryRepository } from "./modules/blogs/infrastructure/blogs.query-repository";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSqlRepository } from './modules/users/infrastructure/users.sql-repository';
import { SecuritySqlRepository } from './modules/security/infrastructure/security.sql-repository';
import { BanUserInfo } from './modules/users/domain/entities/banUser.entity';
import { UsersDevicesSessions } from './modules/users/domain/entities/usersDevices.entity';
import { Users } from './modules/users/domain/entities/user.entity';
// import { MailerModule2 } from "../../swagger-static";

export const adminUseCases = [
  GetBlogsByAdminUseCase,
  BindUserToBlogByAdminUseCase,
  UpdateBanInfoByAdminUseCase,
];
export const blogsUseCases = [
  GetBlogsPublicUseCase,
  GetPostsByBlogUseCase,
  GetBlogUseCase,
  GetBlogsByBloggerUseCase,
  GetBlogByIdByBloggerUseCase,
  GetAllCommentsForBloggerUseCase,
  CreateBlogByBloggerUseCase,
  CreatePostByBlogByBloggerUseCase,
  UpdateBanInfoBlogUseCase,
  UpdateBanStatusUseCase,
  UpdateBlogByBloggerUseCase,
  UpdatePostByBlogByBloggerUseCase,
  DeleteBlogByBloggerUseCase,
  DeletePostByBlogByBloggerUseCase
];
export const usersUseCases = [
  getBannedUsersForBlogUseCase,
  DeleteAllUsersByAdminUseCase,
  DeleteUserByAdminUseCase,
  GetUsersByAdminUseCase,
  CreateUserByAdminUseCase
]
export const authUseCases = [
  LoginAuthUseCase,
  LogoutAuthUseCase,
  NewPasswordAuthUseCase,
  PasswordRecoveryAuthUseCase,
  RegistrationAuthUseCase,
  RegistrationEmailResendAuthUseCase,
  getOwnAccountAuthUseCase,
  ConfirmRegistrationAuthUseCase,
  RefreshTokenAuthUseCase
];
export const commentsUseCases = [
  GetCommentUseCase,
  UpdateCommentUseCase,
  UpdateOmmentLikeStatusUseCase,
  DeleteCommentUseCase
];
export const postsUseCases = [
  GetPostsUseCase,
  GetPostByIdUseCase,
  GetCommentsByPostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
  CreatePostUseCase,
  CreateCommentForPostUseCase,
  DeleteAllPostsUseCase
];
export const securityUseCases = [
  DeleteAllDevicesUseCase,
  DeleteDeviceByIdUseCase,
  GetDevicesUseCase
];
export const useCases = [
  ...adminUseCases,
  ...usersUseCases,
  ...blogsUseCases,
  ...authUseCases,
  ...commentsUseCases,
  ...postsUseCases,
  ...securityUseCases
];
export const services = [
  AuthGuard,
  JwtService,
  BasicAuthGuard,
  EmailConfirmGuard,
  CheckLoginOrEmailGuard,
  recoveryCodeGuard,
  EmailService,
  EmailAdapter,
  AuthService,
  // BlogsService,
  PostsService,
  UsersService,
  TestingService,
  SecurityService,
  CommentsService,
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  },
  {
    provide: APP_GUARD,
    useClass: AuthGuard
  },
  IsLoginOrEmailNotExistsPipe,
  CheckConfirmDataPipe,
  existingBlogPipe
];
export const queryRepo = [
  BlogsQueryRepository,
];
export const controllers = [
  UsersAdminController,
  UsersBloggerController,
  AuthController,
  UsersController,
  BlogsController,
  BlogsBloggerController,
  BlogsPublicController,
  PostsController,
  SecurityController,
  CommentsController,
  TestingController];
export const repo = [
  BlogsRepository,
  PostsRepository,
  UsersRepository,
  CommentsRepository,
  TestingRepository,
  SecurityRepository,
  UsersSqlRepository,
  SecuritySqlRepository,
];
export const allMongooseModels = [
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: User.name, schema: UserSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: Security.name, schema: SecuritySchema }
];
export const moduleImports = [
  CqrsModule,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, "..", "swagger-static"),
    serveRoot: settingsEnv.NODE_ENV === "development" ? "/" : "/swagger"
  }),
  ThrottlerModule.forRoot({
    ttl: 1,
    limit: 5000
  }),
  // TypeOrmModule.forRoot({
  //   type: 'postgres',
  //   host: 'localhost',
  //   port: +settingsEnv.PORT_PG,
  //   username: settingsEnv.LOGIN_PG,
  //   password: settingsEnv.PASS_PG,
  //   database: settingsEnv.DB_NAME,
  //   entities: [
  //     // "src/entity/**/*.ts"
  //   ],
  //   autoLoadEntities: true,
  //   synchronize: true,
  // }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    url: settingsEnv.DATABASE_URL,
    password: settingsEnv.DATABASE_PASS,
    entities: [],
    autoLoadEntities: true,
    synchronize: true,
    poolSize: 4,
  }),
  // TypeOrmModule.forRoot({
  //   type: 'postgres',
  //   // url: process.env.POSTGRES_URL,
  //   // port: process.env.
  //   password: process.env.POSTGRES_PASSWORD,
  //   database: process.env.POSTGRES_DATABASE,
  //   host: process.env.POSTGRES_HOST,
  //   username: process.env.POSTGRES_USER,
  //   entities: [],
  //   autoLoadEntities: true,
  //   synchronize: true,
  // }),
  TypeOrmModule.forFeature([Users, BanUserInfo, UsersDevicesSessions]),
  MongooseModule.forRoot(settingsEnv.MONGO_URL),
  MongooseModule.forFeature(allMongooseModels),
  JwtModule.register({
    global: true,
    secret: settingsEnv.JWT_SECRET,
    signOptions: { expiresIn: '10m' },
  }),
  ConfigModule,
  PassportModule,
  MailerModule.forRoot({
    transport: {
      service: 'gmail',
      auth: {
        user: settingsEnv.EMAIL_LOG,
        pass: settingsEnv.EMAIL_PASS,
      },
    },
    defaults: {
      from: `"Alex" <${settingsEnv.EMAIL_LOG}>`,
    },
  }),

]