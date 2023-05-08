import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { CreateBlogInputModelType, PutBlogInputModelType } from "./type/blogsType";


@Controller("blogs")
export class BlogsController {
  // constructor(private blogsService: PostsService) {}
  constructor(protected blogsService: BlogsService) {
  }
  @Get()
  // getBlogs(@Query("term") term: string) {
  async getBlogs(
    @Query() query: { term: string }
  ) {
    return this.blogsService.findAll(query.term);
  }
  @Get(":id")
  async getBlog(@Param("id") blogId: string) {

  }
  @Get()
  async GetPostsByBlog() {

  }
  @Post("blogs")
  async createBlog(@Body() dto: CreateBlogInputModelType) {
    return this.blogsService.create(dto);
  }
  // @Post()
  // createPostForBlog(@Body() inputModel: PutBlogInputModelType ) {
  //
  // }
  @Put(":id")
  async updateBlog(
    @Param("id")
    @Body() model: PutBlogInputModelType) {
      const blogs = await this.blogsService.findAll('WrongData');
      const result = blogs.find((b) => b.name === 'a')!;

      result.setAge(2000000000)
    // return this.blogsService.save({} as CreateBlogInputModelType)

  }
  @Delete((":id"))
  async deleteBlog(@Param("id") blogId: string) {

  }
  @Delete()
  async deleteAllBlog() {

  }

}