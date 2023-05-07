import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import { MongooseModule } from "@nestjs/mongoose";
import { BlogsModule } from "./blogs/blogs.module";
import { BlogsController } from "./blogs/blogs.controller";
import { BlogsService } from "./blogs/blogs.service";
import { ServeStaticModule } from "@nestjs/serve-static";
import { settingsEnv } from "./settings/settings";
import { join } from "path";





@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath:join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger'
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    BlogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
