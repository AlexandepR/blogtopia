import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from '@nestjs/config';
import { MongooseModule } from "@nestjs/mongoose";
import { BlogsModule } from "./blogs/blogs.module";
import { BlogsController } from "./blogs/blogs.controller";
import { BlogsService } from "./blogs/blogs.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    BlogsModule,
  ],
  controllers: [AppController, BlogsController],
  providers: [AppService, BlogsService],
})
export class AppModule {}
