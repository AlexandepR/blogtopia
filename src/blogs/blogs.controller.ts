import { Body, Controller, Get, Post } from "@nestjs/common";
import { BlogsService } from "./blogs.service";


@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Get()
  findAll() {
    return this.blogsService.findAll()
  }

  @Post()
  createOne(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createOne(createBlogDto);
  }
}