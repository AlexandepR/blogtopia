import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { BlogsController } from "./blogs/blogs.controller";
import { BlogsRepository } from "./blogs/blogs.repository";
import { BlogsService } from "./blogs/blogs.service";
import { settingsEnv } from "./settings/settings";
import { Blog, BlogSchema } from "./blogs/type/blogs.schema";


@Module({
  imports: [
    // MongooseModule.forRoot(settingsEnv.MONGO_URL),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "swagger-static"),
      serveRoot: process.env.NODE_ENV === "development" ? "/" : "/swagger"
    }),
    ConfigModule.forRoot(),
    // MongooseModule.forRoot(process.env.MONGO_URL, {
    MongooseModule.forRoot('mongodb:127.0.0.1:27017', {
      dbName: 'blogtopia',
      loggerLevel: 'debug',
    }),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ])
    // BlogsRepository
  ],
  controllers: [AppController, BlogsController],
  providers: [AppService, BlogsService, BlogsRepository]
})
export class AppModule {
}
