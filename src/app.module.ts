// const configModule = getConfigModule;
import { ConfigModule } from "@nestjs/config";
// const configModule = configModule;
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { Post, PostSchema } from "./modules/posts/type/posts.schema";
import { Comment, CommentSchema } from "./modules/comments/type/comments.schema";
import { User, UserSchema } from "./modules/users/type/users.schema";
import { settingsEnv } from "./settings/settings";
import { ThrottlerModule } from "@nestjs/throttler";
import { Security, SecuritySchema } from "./modules/security/type/security.schema";
import { MailerModule } from "@nestjs-modules/mailer";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { GetBlogsPublicUseCase } from "./modules/blogs/application/use-cases/public/get-blogs-public-use-case";
import { Blog, BlogSchema } from "./modules/blogs/type/blogs.schema";
import { allMongooseModels, controllers, moduleImports, repo, services, useCases } from "./use-cases";


// const mongooseModels = [...allMongooseModels];
@Module({
  imports: [...moduleImports],
  controllers: [...controllers],
  providers: [...services, ...repo, ...useCases,]
})
export class AppModule {
}