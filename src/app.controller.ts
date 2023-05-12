import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { BlogsService } from "./blogs/blogs.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private readonly blogsService: UsersService,
    ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
